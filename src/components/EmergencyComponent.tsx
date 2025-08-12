/**
 * Emergency Component for Quick Access to Emergency Services
 * Mobile-optimized emergency features with GPS and quick dial
 */

import React, { useState, useEffect } from 'react';
import { Phone, MapPin, AlertTriangle, Navigation, Clock, Star } from 'lucide-react';
import { useMobile, useGeolocation } from '../hooks/useMobile';

interface Hospital {
  name: string;
  address: string;
  distance: string;
  phone: string;
  emergency: boolean;
  rating: number;
}

interface EmergencyComponentProps {
  className?: string;
}

const EmergencyComponent: React.FC<EmergencyComponentProps> = ({ className = "" }) => {
  const { callEmergency, showEmergencyAlert, vibrate, isNative } = useMobile();
  const { getCurrentLocation, findNearbyHospitals, location, isLoading, error } = useGeolocation();
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  useEffect(() => {
    if (location) {
      loadNearbyHospitals();
    }
  }, [location]);

  const loadNearbyHospitals = async () => {
    try {
      const hospitals = await findNearbyHospitals();
      setNearbyHospitals(hospitals);
    } catch (error) {
      console.error('Failed to load nearby hospitals:', error);
    }
  };

  const handleEmergencyCall = async () => {
    try {
      await vibrate('heavy');
      await showEmergencyAlert('Calling emergency services (108). Stay on the line and provide your location.');
      await callEmergency();
      setIsEmergencyMode(true);
    } catch (error) {
      console.error('Failed to make emergency call:', error);
      alert('Failed to make emergency call. Please dial 108 manually.');
    }
  };

  const handleGetLocation = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const handleCallHospital = (phone: string) => {
    if (isNative) {
      window.open(`tel:${phone}`, '_self');
    } else {
      window.open(`tel:${phone}`, '_blank');
    }
  };

  const handleGetDirections = (address: string) => {
    const query = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapsUrl, '_blank');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Emergency Call Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Emergency Services</h3>
        </div>

        <button
          onClick={handleEmergencyCall}
          className="w-full flex items-center justify-center px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-medium"
        >
          <Phone className="w-6 h-6 mr-3" />
          Call Emergency (108)
        </button>

        {isEmergencyMode && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">
              Emergency mode activated. Stay calm and follow the operator's instructions.
            </p>
          </div>
        )}
      </div>

      {/* Location Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-blue-500 mr-2" />
            <h4 className="text-md font-medium text-gray-800">Your Location</h4>
          </div>
          <button
            onClick={handleGetLocation}
            disabled={isLoading}
            className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm disabled:opacity-50"
          >
            <Navigation className="w-4 h-4 mr-1" />
            {isLoading ? 'Getting...' : 'Get Location'}
          </button>
        </div>

        {location ? (
          <div className="text-sm text-gray-600">
            <p>Latitude: {location.latitude.toFixed(6)}</p>
            <p>Longitude: {location.longitude.toFixed(6)}</p>
            <p>Accuracy: ±{location.accuracy.toFixed(0)}m</p>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-sm text-gray-500">Location not available. Tap "Get Location" to enable.</p>
        )}
      </div>

      {/* Nearby Hospitals Section */}
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Clock className="w-5 h-5 text-green-500 mr-2" />
          <h4 className="text-md font-medium text-gray-800">Nearby Hospitals</h4>
        </div>

        {!location ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Enable location to find nearby hospitals and clinics
          </p>
        ) : nearbyHospitals.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No hospitals found in your area
          </p>
        ) : (
          <div className="space-y-3">
            {nearbyHospitals.map((hospital, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-gray-800 flex items-center">
                      {hospital.name}
                      {hospital.emergency && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          Emergency
                        </span>
                      )}
                    </h5>
                    <p className="text-sm text-gray-600">{hospital.address}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center mr-3">
                        {renderStars(hospital.rating)}
                        <span className="ml-1 text-xs text-gray-500">{hospital.rating}</span>
                      </div>
                      <span className="text-sm text-blue-600 font-medium">{hospital.distance}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleCallHospital(hospital.phone)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </button>
                  <button
                    onClick={() => handleGetDirections(hospital.address)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Info */}
      <div className="p-6 bg-gray-50 rounded-b-lg">
        <h5 className="text-sm font-medium text-gray-800 mb-2">Emergency Information</h5>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• For medical emergencies, call 108 (free from any phone)</p>
          <p>• Fire emergency: 101</p>
          <p>• Police emergency: 100</p>
          <p>• Women helpline: 1091</p>
          <p>• Child helpline: 1098</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyComponent;