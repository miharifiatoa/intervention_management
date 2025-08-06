import { User } from '../models/index.js';

// Middleware pour rendre l'utilisateur disponible globalement
export function setLocals(req, res, next) {
    res.locals.user = req.session.user || null;
    res.locals.title = 'Dashboard'; // Titre par défaut
    next();
}

export function requireAuth(req, res, next) {
    if (!req.session.user) {
        console.log('🔒 Redirection: Utilisateur non authentifié');
        return res.redirect('/auth/login');
    }
    next();
}

export async function requireAdmin(req, res, next) {
    try {
        const user = await User.findOne({ where: { id: req.session.user.id } });
        if (!user || user.role !== 'admin') {
            console.error('❌ Accès interdit: Utilisateur non admin ou introuvable');
            return res.status(403).send('Accès interdit');
        }
        next();
    } catch (error) {
        console.error('❌ Erreur dans requireAdmin:', error);
        res.status(500).send('Erreur serveur');
    }
}
