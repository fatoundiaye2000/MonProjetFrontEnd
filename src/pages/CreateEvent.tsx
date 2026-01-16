import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date: '',
    heure: '18:00',
    lieu: '',
    ville: '',
    codePostal: '',
    type: 'Festival',
    places: 100,
    prix: 0,
    image: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Simuler une création d'événement
    setTimeout(() => {
      console.log('Événement créé:', formData);
      setLoading(false);
      setMessage('✅ Événement créé avec succès !');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/dashboard/evenements');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">➕ Créer un événement</h1>
              <p className="text-gray-600 mt-2">
                Remplissez le formulaire pour créer un nouvel événement culturel
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/evenements')}
              className="px-6 py-3 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-100 text-blue-700 border border-blue-300'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Section 1: Informations générales */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Informations générales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de l'événement *
                    </label>
                    <input
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Festival de Jazz International"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'événement *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Festival">Festival</option>
                      <option value="Concert">Concert</option>
                      <option value="Exposition">Exposition</option>
                      <option value="Spectacle">Spectacle</option>
                      <option value="Conférence">Conférence</option>
                      <option value="Atelier">Atelier</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Décrivez votre événement..."
                  />
                </div>
              </div>

              {/* Section 2: Date et heure */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Date et heure</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure *
                    </label>
                    <input
                      type="time"
                      name="heure"
                      value={formData.heure}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Lieu */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Lieu</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu (salle, adresse) *
                    </label>
                    <input
                      type="text"
                      name="lieu"
                      value={formData.lieu}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Salle des fêtes, Théâtre municipal..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville *
                      </label>
                      <input
                        type="text"
                        name="ville"
                        value={formData.ville}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Paris"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        name="codePostal"
                        value={formData.codePostal}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="75000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Places et tarifs */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Places et tarifs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de places *
                    </label>
                    <input
                      type="number"
                      name="places"
                      value={formData.places}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix par place (€) *
                    </label>
                    <input
                      type="number"
                      name="prix"
                      value={formData.prix}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.prix === 0 && (
                      <p className="mt-1 text-sm text-green-600">L'événement sera marqué comme "Gratuit"</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 5: Image */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Image de l'événement</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image (optionnelle)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Télécharger une image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF jusqu'à 10MB
                      </p>
                    </div>
                  </div>
                  {formData.image && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        Image sélectionnée : <span className="font-medium">{formData.image.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons de soumission */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/evenements')}
                    className="px-6 py-3 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création en cours...
                      </>
                    ) : (
                      'Créer l\'événement'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">Création d'événement</p>
            <p className="text-gray-400 text-sm">
              Créez vos événements culturels en quelques clics
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}