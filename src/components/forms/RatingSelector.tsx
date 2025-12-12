// src/components/forms/RatingSelector.tsx - 5 STAR RATING SYSTEM
import { useState } from 'react';
import { InspectionComponentConfig, RatingChoice } from '../../types/inspection.types';
import { Camera, Star } from 'lucide-react';
import * as Icons from 'lucide-react';

interface RatingSelectorProps {
  config: InspectionComponentConfig;
  value: RatingChoice | null;
  onChange: (choice: RatingChoice) => void;
  onPhotoAdd?: () => void;
  hasPhoto?: boolean;
  genZMode?: boolean;
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

export const RatingSelector = ({
  config,
  value,
  onChange,
  onPhotoAdd,
  hasPhoto,
  genZMode = false,
  notes,
  onNotesChange,
}: RatingSelectorProps) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const label = genZMode ? config.labelGenZ : config.label;

  // Get Lucide icon component for professional mode
  const IconComponent = !genZMode && config.icon ? (Icons as any)[config.icon] : null;

  const handleStarClick = (rating: RatingChoice) => {
    onChange(rating);
  };

  const getStarColor = (starNumber: number): string => {
    const activeRating = hoveredStar !== null ? hoveredStar : value;

    if (activeRating === null) return 'text-gray-300';

    if (starNumber <= activeRating) {
      // Filled stars - color based on rating
      if (activeRating >= 4) return 'text-yellow-400'; // 4-5 stars = gold
      if (activeRating === 3) return 'text-blue-400'; // 3 stars = blue
      return 'text-orange-400'; // 1-2 stars = orange/red
    }

    return 'text-gray-300'; // Empty stars
  };

  const getRatingLabel = (rating: number | null): string => {
    if (!rating) return 'Belum dinilai';

    const labels = {
      5: '⭐⭐⭐⭐⭐ Sangat Baik',
      4: '⭐⭐⭐⭐ Baik',
      3: '⭐⭐⭐ Cukup',
      2: '⭐⭐ Kurang',
      1: '⭐ Buruk',
    };

    return labels[rating as keyof typeof labels] || '';
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-2xl
            ${genZMode ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-blue-50'}
          `}
          >
            {genZMode ? (
              config.iconGenZ
            ) : IconComponent ? (
              <IconComponent className="w-6 h-6 text-blue-600" />
            ) : (
              config.icon
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${genZMode ? 'text-purple-900' : 'text-gray-900'}`}>
              {label}
              {config.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {!config.required && <span className="text-xs text-gray-500">Opsional</span>}
          </div>
        </div>

        {/* Photo Button */}
        {config.allowPhoto && (
          <button
            type="button"
            onClick={onPhotoAdd}
            className={`
              p-2 rounded-xl transition-all
              ${
                hasPhoto
                  ? 'bg-green-100 text-green-600'
                  : genZMode
                    ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 5-Star Rating */}
      <div className="flex flex-col items-center space-y-3 py-4">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star as RatingChoice)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="transition-all transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`w-10 h-10 transition-colors ${getStarColor(star)}`}
                fill={star <= (hoveredStar !== null ? hoveredStar : value || 0) ? 'currentColor' : 'none'}
                strokeWidth={2}
              />
            </button>
          ))}
        </div>

        {/* Rating Label */}
        <div className="text-center">
          <p className={`text-sm font-medium ${
            value
              ? value >= 4
                ? 'text-yellow-600'
                : value === 3
                  ? 'text-blue-600'
                  : 'text-orange-600'
              : 'text-gray-400'
          }`}>
            {getRatingLabel(hoveredStar !== null ? hoveredStar : value)}
          </p>
        </div>
      </div>

      {/* Show notes toggle */}
      {value && !showNotes && (
        <button
          type="button"
          onClick={() => setShowNotes(true)}
          className={`
            w-full mt-3 py-2 text-sm font-medium rounded-xl
            ${
              genZMode
                ? 'text-purple-600 hover:bg-purple-50'
                : 'text-blue-600 hover:bg-blue-50'
            }
          `}
        >
          + Tambah catatan
        </button>
      )}

      {/* Notes Section */}
      {showNotes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <textarea
            value={notes || ''}
            onChange={(e) => onNotesChange?.(e.target.value)}
            placeholder="Catatan tambahan (opsional)..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
          <button
            type="button"
            onClick={() => setShowNotes(false)}
            className="text-sm text-gray-500 hover:text-gray-700 mt-1"
          >
            × Sembunyikan catatan
          </button>
        </div>
      )}
    </div>
  );
};
