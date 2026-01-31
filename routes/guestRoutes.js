import express from 'express';
import Guest from '../models/Guest.js';
import { protect } from '../middleware/auth.js';
import { sendInvitationEmail } from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/guests
// @desc    Créer un nouvel invité (RSVP)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, status, plusOne, message, relation } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Le nom et l\'email sont requis' });
    }

    // Vérifier si l'email existe déjà
    const existingGuest = await Guest.findOne({ email: email.toLowerCase() });
    if (existingGuest) {
      return res.status(400).json({ 
        message: 'Cet email a déjà été utilisé pour une invitation',
        guest: existingGuest
      });
    }

    // Créer un nouvel invité
    const guest = await Guest.create({
      name,
      email: email.toLowerCase(),
      status: status || 'pending',
      plusOne: plusOne || false,
      message: message || '',
      relation: relation || undefined
    });

    // Envoyer l'email d'invitation (en arrière-plan, ne bloque pas la réponse)
    sendInvitationEmail(guest).catch(err => {
      console.error('Erreur lors de l\'envoi de l\'email (non bloquant):', err);
      // L'erreur d'email ne doit pas empêcher la création de l'invité
    });

    res.status(201).json({
      success: true,
      data: guest
    });
  } catch (error) {
    console.error('Erreur création invité:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la création de l\'invité',
      error: error.message 
    });
  }
});

// @route   GET /api/guests
// @desc    Récupérer tous les invités
// @access  Private (Admin seulement)
router.get('/', protect, async (req, res) => {
  try {
    const guests = await Guest.find().sort({ invitedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: guests.length,
      data: guests
    });
  } catch (error) {
    console.error('Erreur récupération invités:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des invités',
      error: error.message 
    });
  }
});

// @route   GET /api/guests/stats
// @desc    Récupérer les statistiques
// @access  Private (Admin seulement)
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Guest.countDocuments();
    
    // Récupérer tous les invités pour calculer le nombre réel de personnes
    const allGuests = await Guest.find();
    
    // Calculer le nombre total de personnes (chaque invité compte pour 1, +1 si plusOne)
    let confirmedPersons = 0;
    let declinedPersons = 0;
    let pendingPersons = 0;
    
    allGuests.forEach(guest => {
      const personCount = guest.plusOne ? 2 : 1;
      if (guest.status === 'confirmed') {
        confirmedPersons += personCount;
      } else if (guest.status === 'declined') {
        declinedPersons += personCount;
      } else {
        pendingPersons += personCount;
      }
    });
    
    const confirmed = await Guest.countDocuments({ status: 'confirmed' });
    const declined = await Guest.countDocuments({ status: 'declined' });
    const pending = await Guest.countDocuments({ status: 'pending' });
    const withPlusOne = await Guest.countDocuments({ plusOne: true });

    res.status(200).json({
      success: true,
      data: {
        total,
        confirmed: confirmedPersons, // Nombre de personnes confirmées (avec plusOne compté)
        declined: declinedPersons,   // Nombre de personnes déclinées (avec plusOne compté)
        pending: pendingPersons,     // Nombre de personnes en attente (avec plusOne compté)
        withPlusOne
      }
    });
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des statistiques',
      error: error.message 
    });
  }
});

// @route   GET /api/guests/:id
// @desc    Récupérer un invité par ID
// @access  Private (Admin seulement)
router.get('/:id', protect, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    
    if (!guest) {
      return res.status(404).json({ message: 'Invité non trouvé' });
    }

    res.status(200).json({
      success: true,
      data: guest
    });
  } catch (error) {
    console.error('Erreur récupération invité:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération de l\'invité',
      error: error.message 
    });
  }
});

// @route   PUT /api/guests/:id
// @desc    Mettre à jour un invité
// @access  Private (Admin seulement)
router.put('/:id', protect, async (req, res) => {
  try {
    // Préparer les données à mettre à jour
    const updateData = { ...req.body };
    
    // Si relation est une chaîne vide, la convertir en null
    if (updateData.relation === '') {
      updateData.relation = null;
    }
    
    // Si email est fourni, le convertir en lowercase
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!guest) {
      return res.status(404).json({ message: 'Invité non trouvé' });
    }

    res.status(200).json({
      success: true,
      data: guest
    });
  } catch (error) {
    console.error('Erreur mise à jour invité:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour de l\'invité',
      error: error.message 
    });
  }
});

// @route   DELETE /api/guests/:id
// @desc    Supprimer un invité
// @access  Private (Admin seulement)
router.delete('/:id', protect, async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);

    if (!guest) {
      return res.status(404).json({ message: 'Invité non trouvé' });
    }

    res.status(200).json({
      success: true,
      message: 'Invité supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression invité:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression de l\'invité',
      error: error.message 
    });
  }
});

export default router;




