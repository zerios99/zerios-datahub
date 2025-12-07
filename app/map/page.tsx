'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    google: any;
  }
}

export default function MapPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Form state
  const [city, setCity] = useState('');
  const [popularPlaceName, setPopularPlaceName] = useState('');
  const [formalPlaceName, setFormalPlaceName] = useState('');
  const [street, setStreet] = useState('');
  const [side, setSide] = useState('');
  const [category, setCategory] = useState('');
  const [belongsToRoute, setBelongsToRoute] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [photoConfidence, setPhotoConfidence] = useState<'100' | '90'>('100');
  const [notes, setNotes] = useState('');
  const [pointType, setPointType] = useState<'new' | 'edit'>('new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Options for dropdowns
  const CITIES = ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama'];
  const SIDES = ['Baramkeh Side', 'Mazzeh Side', 'Malki Side', 'Shaalan Side'];
  const CATEGORIES = [
    'Bridge / Tunnel',
    'Intersection',
    'Roundabout',
    'Street',
    'Landmark',
    'Building',
  ];
  const ROUTES = ['Route 1', 'Route 2', 'Route 3', 'Route 4', 'Route 5'];

  // Mobile bottom sheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
        return;
      }

      if (mapRef.current && window.google) {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.006 },
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        setMap(mapInstance);

        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setSelectedLocation({ lat, lng });

            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            const newMarker = new window.google.maps.Marker({
              position: { lat, lng },
              map: mapInstance,
              title: 'Selected Location',
              animation: window.google.maps.Animation.DROP,
            });

            markerRef.current = newMarker;

            // Open bottom sheet on mobile when location is selected
            if (window.innerWidth < 768) {
              setIsBottomSheetOpen(true);
            }
          }
        });
      }
    };

    if (user) {
      initMap();
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const response = await fetch('/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
          }),
        });

        if (!response.ok) throw new Error('Failed to get upload URL');

        const { uploadUrl, fileUrl } = await response.json();

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload file');

        uploadedUrls.push(fileUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) {
      setMessage({ type: 'error', text: 'Please select a location on the map' });
      return;
    }

    if (!popularPlaceName || !city || !street || !side || !category) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (images.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one photo' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      }

      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: popularPlaceName,
          formalPlaceName,
          city,
          street,
          side,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          category,
          belongsToRoute,
          photoConfidence,
          notes,
          pointType,
          isSponsored: false,
          images: imageUrls,
        }),
      });

      if (!response.ok) throw new Error('Failed to save location');

      setMessage({
        type: 'success',
        text: 'Location saved successfully! It will be reviewed by admin.',
      });

      // Reset form
      setCity('');
      setPopularPlaceName('');
      setFormalPlaceName('');
      setStreet('');
      setSide('');
      setCategory('');
      setBelongsToRoute('');
      setImages([]);
      setPhotoConfidence('100');
      setNotes('');
      setPointType('new');
      setSelectedLocation(null);
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

      const fileInput = document.getElementById('images') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Close bottom sheet on mobile after successful save
      if (isMobile) {
        setTimeout(() => {
          setIsBottomSheetOpen(false);
          setMessage(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      setMessage({ type: 'error', text: 'Failed to save location. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCity('');
    setPopularPlaceName('');
    setFormalPlaceName('');
    setStreet('');
    setSide('');
    setCategory('');
    setBelongsToRoute('');
    setImages([]);
    setPhotoConfidence('100');
    setNotes('');
    setPointType('new');
    setSelectedLocation(null);
    setMessage(null);
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    setIsBottomSheetOpen(false);
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-xl text-gray-600'>Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const formContent = (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {selectedLocation && (
        <div className='p-3 bg-blue-50 rounded-lg border border-blue-200'>
          <p className='text-xs font-semibold text-blue-900 mb-1'>Selected Coordinates</p>
          <p className='text-xs text-blue-800'>
            <span className='font-medium'>Lat:</span> {selectedLocation.lat.toFixed(6)},
            <span className='font-medium ml-2'>Lng:</span>{' '}
            {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* City */}
      <div>
        <label htmlFor='city' className='block text-sm font-medium text-gray-700 mb-1'>
          City
        </label>
        <select
          id='city'
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white'
          required>
          <option value=''>Please select</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 1) Popular place name (required) */}
      <div>
        <label
          htmlFor='popularPlaceName'
          className='block text-sm font-medium text-gray-700 mb-1'>
          1) Popular place name (required)
        </label>
        <input
          type='text'
          id='popularPlaceName'
          value={popularPlaceName}
          onChange={(e) => setPopularPlaceName(e.target.value)}
          placeholder='e.g. Jisr al-Hurriyah – Baramkeh Side'
          className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white'
          required
        />
      </div>

      {/* 2) Formal place name */}
      <div>
        <label
          htmlFor='formalPlaceName'
          className='block text-sm font-medium text-gray-700 mb-1'>
          2) Formal place name
        </label>
        <input
          type='text'
          id='formalPlaceName'
          value={formalPlaceName}
          onChange={(e) => setFormalPlaceName(e.target.value)}
          placeholder='e.g. Yusuf al-Azmah Square'
          className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white'
        />
      </div>

      {/* 3) Street (required) */}
      <div>
        <label htmlFor='street' className='block text-sm font-medium text-gray-700 mb-1'>
          3) Street (required)
        </label>
        <input
          type='text'
          id='street'
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder='e.g. Revolution Street'
          className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white'
          required
        />
      </div>

      {/* 4) Side and 5) Category - side by side */}
      <div className='flex gap-3'>
        <div className='flex-1'>
          <label htmlFor='side' className='block text-sm font-medium text-gray-700 mb-1'>
            4) Side (required)
          </label>
          <select
            id='side'
            value={side}
            onChange={(e) => setSide(e.target.value)}
            className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white'
            required>
            <option value=''>Select</option>
            {SIDES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className='flex-1'>
          <label
            htmlFor='category'
            className='block text-sm font-medium text-gray-700 mb-1'>
            5) Category (required)
          </label>
          <select
            id='category'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white'
            required>
            <option value=''>Select</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Belongs to route (optional) */}
      <div>
        <label
          htmlFor='belongsToRoute'
          className='block text-sm font-medium text-gray-700 mb-1'>
          Belongs to route (optional)
        </label>
        <select
          id='belongsToRoute'
          value={belongsToRoute}
          onChange={(e) => setBelongsToRoute(e.target.value)}
          className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white'>
          <option value=''>Please select</option>
          {ROUTES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* 6) Photo (required) */}
      <div>
        <label htmlFor='images' className='block text-sm font-medium text-gray-700 mb-1'>
          6) Photo (required)
        </label>
        <div className='flex items-start gap-4'>
          <label
            htmlFor='images'
            className='inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700'>
            <span className='text-blue-600 text-lg'>+</span> Add photo
          </label>
          <input
            type='file'
            id='images'
            multiple
            accept='image/*'
            onChange={handleImageChange}
            className='hidden'
          />
          <div className='flex flex-col gap-1'>
            <label className='flex items-center gap-2 text-sm text-gray-700'>
              <input
                type='radio'
                name='photoConfidence'
                value='100'
                checked={photoConfidence === '100'}
                onChange={() => setPhotoConfidence('100')}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              />
              100% sure
            </label>
            <label className='flex items-center gap-2 text-sm text-gray-700'>
              <input
                type='radio'
                name='photoConfidence'
                value='90'
                checked={photoConfidence === '90'}
                onChange={() => setPhotoConfidence('90')}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              />
              90% or less sure
            </label>
          </div>
        </div>
        {images.length > 0 && (
          <p className='mt-2 text-xs text-gray-600'>{images.length} file(s) selected</p>
        )}
      </div>

      {/* 8) Notes */}
      <div>
        <label htmlFor='notes' className='block text-sm font-medium text-gray-700 mb-1'>
          8) Notes
        </label>
        <input
          type='text'
          id='notes'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='e.g. Under the bridge – Baramkeh Side'
          className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white'
        />
      </div>

      {/* New point / Edit existing point */}
      <div className='flex items-center gap-6'>
        <label className='flex items-center gap-2 text-sm text-gray-700'>
          <input
            type='radio'
            name='pointType'
            value='new'
            checked={pointType === 'new'}
            onChange={() => setPointType('new')}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
          />
          New point
        </label>
        <label className='flex items-center gap-2 text-sm text-gray-700'>
          <input
            type='radio'
            name='pointType'
            value='edit'
            checked={pointType === 'edit'}
            onChange={() => setPointType('edit')}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
          />
          Edit existing point
        </label>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
          {message.text}
        </div>
      )}

      <button
        type='submit'
        disabled={isSubmitting || !selectedLocation}
        className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm'>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );

  return (
    <div className='h-screen flex flex-col md:flex-row overflow-hidden'>
      {/* Desktop Sidebar */}
      <div className='hidden md:flex md:w-96 bg-white shadow-lg flex-col flex-shrink-0'>
        <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Add Location</h1>
            <p className='text-xs text-gray-600'>Click on the map to select</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className='text-sm text-blue-600 hover:text-blue-700'>
            Dashboard
          </button>
        </div>
        <div className='flex-1 overflow-y-auto p-4'>
          {formContent}
        </div>
      </div>

      {/* Map Container */}
      <div className='flex-1 relative'>
        <div ref={mapRef} className='w-full h-full' />

        {/* Mobile Header */}
        <div className='md:hidden absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-10'>
          <div className='flex items-center justify-between p-3'>
            <h1 className='text-lg font-bold text-gray-900'>Add Location</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
              Dashboard
            </button>
          </div>
          {!selectedLocation && (
            <p className='px-3 pb-3 text-xs text-gray-600'>
              Tap on the map to select a location
            </p>
          )}
        </div>

        {/* Mobile: Selected Location Indicator */}
        {isMobile && selectedLocation && !isBottomSheetOpen && (
          <button
            onClick={() => setIsBottomSheetOpen(true)}
            className='absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg font-medium z-10 flex items-center gap-2'>
            <span>Add Details</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <>
          {/* Backdrop */}
          {isBottomSheetOpen && (
            <div
              className='fixed inset-0 bg-black/50 z-40'
              onClick={() => setIsBottomSheetOpen(false)}
            />
          )}

          {/* Bottom Sheet */}
          <div
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
              isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ maxHeight: '85vh' }}>
            {/* Handle */}
            <div className='flex justify-center pt-3 pb-2'>
              <div className='w-12 h-1.5 bg-gray-300 rounded-full' />
            </div>

            {/* Header */}
            <div className='flex items-center justify-between px-4 pb-3 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>Location Details</h2>
              <button
                onClick={resetForm}
                className='text-gray-500 hover:text-gray-700 p-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div
              className='overflow-y-auto p-4'
              style={{ maxHeight: 'calc(85vh - 80px)' }}>
              {formContent}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
