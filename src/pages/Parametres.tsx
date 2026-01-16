import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Parametres() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    newsletter: true,
    emailUpdates: false,
    darkMode: false,
    language: 'fr',
    timezone: 'Europe/Paris'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setLoading(true);
    setMessage('');
    
    // Simuler la sauvegarde
    setTimeout(() => {
      console.log('Paramètres sauvegardés:', settings);
      setLoading(false);
      setMessage('✅ Paramètres sauvegardés avec succès !');
      
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⚙️ Paramètres</h1>
              <p className="text-gray-600 mt-2">
                Gérez les paramètres de votre compte et de la plateforme
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Retour
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {message && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-lg">
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* Section 1: Notifications */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🔔 Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notifications par email</p>
                  <p className="text-sm text-gray-600">Recevez des emails pour les nouvelles réservations</p>
                </div>
                <button
                  onClick={() => handleToggle('notifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Newsletter</p>
                  <p className="text-sm text-gray-600">Recevez notre newsletter mensuelle</p>
                </div>
                <button
                  onClick={() => handleToggle('newsletter')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.newsletter ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.newsletter ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Mises à jour par email</p>
                  <p className="text-sm text-gray-600">Notifications pour les mises à jour de la plateforme</p>
                </div>
                <button
                  onClick={() => handleToggle('emailUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.emailUpdates ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Apparence */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🎨 Apparence</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Mode sombre</p>
                  <p className="text-sm text-gray-600">Activez le mode sombre pour un confort visuel</p>
                </div>
                <button
                  onClick={() => handleToggle('darkMode')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    settings.darkMode ? 'bg-gray-800' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Langue et région */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🌍 Langue et région</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Langue
                </label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleSelectChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuseau horaire
                </label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleSelectChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Sécurité */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">🔒 Sécurité</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 mb-2">Changer le mot de passe</p>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Mot de passe actuel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirmer le nouveau mot de passe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </div>

          {/* Boutons de sauvegarde */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-medium"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sauvegarde en cours...
                  </>
                ) : (
                  'Sauvegarder les paramètres'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">Paramètres</p>
            <p className="text-gray-400 text-sm">
              Personnalisez votre expérience sur la plateforme
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}