import { LostPet, Pet, Notification, User } from '../models/index.js';
import { sendSMS } from '../services/twilio.js';

export const reportLost = async (req, res) => {
  try {
    const { petId, missingSince, lastSeenCity, lastSeenLocation, reward, description } = req.body;

    const pet = await Pet.findOne({ _id: petId, owner: req.user._id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found or unauthorized' });
    }

    pet.status = 'missing';
    await pet.save();

    const lostPet = await LostPet.create({
      pet: petId,
      missingSince: missingSince || new Date(),
      lastSeenCity,
      lastSeenLocation,
      reward: reward || 0,
      description,
      status: 'missing'
    });

    await Notification.create({
      user: req.user._id,
      title: 'Alert: Pet marked as Missing',
      message: `${pet.name} has been marked as missing. A public record is created.`,
      type: 'lost',
      status: 'unread',
      link: `/dashboard`
    });

    res.status(201).json({
      success: true,
      message: 'Pet reported missing',
      lostPet
    });
  } catch (error) {
    console.error('Error in reportLost:', error);
    res.status(500).json({ success: false, message: 'Server error reporting missing pet' });
  }
};

export const getLostPets = async (req, res) => {
  try {
    const { lastSeenCity, breed, species, search } = req.query;
    
    const query = { status: 'missing' };
    
    if (lastSeenCity) query.lastSeenCity = { $regex: lastSeenCity, $options: 'i' };

    let petFilter = {};
    if (breed) petFilter.breed = { $regex: breed, $options: 'i' };
    if (species) petFilter.species = { $regex: species, $options: 'i' };
    if (search) {
      petFilter.name = { $regex: search, $options: 'i' };
    }

    let lostPets = await LostPet.find(query).populate({
      path: 'pet',
      match: petFilter
    });

    lostPets = lostPets.filter(lp => lp.pet !== null);

    res.status(200).json({
      success: true,
      lostPets
    });
  } catch (error) {
    console.error('Error in getLostPets:', error);
    res.status(500).json({ success: false, message: 'Server error fetching lost list' });
  }
};

export const reportFoundByFinder = async (req, res) => {
  try {
    const { petId } = req.params;
    const { finderName, finderPhone, finderMessage } = req.body;

    const lostPet = await LostPet.findOne({ pet: petId, status: 'missing' }).populate('pet');
    if (!lostPet) {
      return res.status(404).json({ success: false, message: 'No active missing record found for this pet' });
    }

    lostPet.status = 'found';
    lostPet.foundAt = new Date();
    await lostPet.save();

    const pet = lostPet.pet;
    pet.status = 'active'; // Returns to active status upon recovery
    await pet.save();

    const owner = await User.findById(pet.owner);
    if (owner) {
      await Notification.create({
        user: owner._id,
        title: 'Pet Sighting / Recovery Sourced',
        message: `Someone reported they found ${pet.name}! Sighting Details: Contact ${finderName} at ${finderPhone}. Message: "${finderMessage}"`,
        type: 'lost',
        status: 'unread',
        link: '/dashboard',
        metadata: { finderPhone, finderName }
      });

      if (owner.phone) {
        const smsMessage = `PAWIDENTITY Alert: ${finderName} reported finding ${pet.name}. Phone: ${finderPhone}. Msg: ${finderMessage}`;
        await sendSMS(owner.phone, smsMessage);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Owner has been notified of your report. Thank you!'
    });
  } catch (error) {
    console.error('Error in reportFoundByFinder:', error);
    res.status(500).json({ success: false, message: 'Server error filing found report' });
  }
};

export const closeLostCase = async (req, res) => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findOne({ _id: petId, owner: req.user._id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found or unauthorized' });
    }

    pet.status = 'active';
    await pet.save();

    const lostPet = await LostPet.findOne({ pet: petId, status: 'missing' });
    if (lostPet) {
      lostPet.status = 'closed';
      lostPet.closedAt = new Date();
      await lostPet.save();
    }

    res.status(200).json({
      success: true,
      message: 'Recovery case successfully closed. Welcome home!'
    });
  } catch (error) {
    console.error('Error in closeLostCase:', error);
    res.status(500).json({ success: false, message: 'Server error closing lost case' });
  }
};
