import { useState, useRef, useEffect } from 'react';

interface MarineZone {
  zone_code: string;
  location_name: string;
  synopsis_zone: string;
  latitude?: number;
  longitude?: number;
}

interface LocationSelectorProps {
  zones: MarineZone[];
  selectedZone: string;
  onZoneChange: (zoneCode: string) => void;
}

export default function LocationSelector({ zones, selectedZone, onZoneChange }: LocationSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredZones, setFilteredZones] = useState<MarineZone[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize input value with selected zone
  useEffect(() => {
    const selectedZoneObj = zones.find(zone => zone.zone_code === selectedZone);
    if (selectedZoneObj) {
      setInputValue(`${selectedZoneObj.zone_code} - ${selectedZoneObj.location_name}`);
    }
  }, [selectedZone, zones]);

  // Filter zones based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredZones(zones);
    } else {
      const filtered = zones.filter(zone => 
        zone.zone_code.toLowerCase().includes(inputValue.toLowerCase()) ||
        zone.location_name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredZones(filtered);
    }
    setHighlightedIndex(-1);
  }, [inputValue, zones]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  // Handle zone selection
  const handleZoneSelect = (zone: MarineZone) => {
    setInputValue(`${zone.zone_code} - ${zone.location_name}`);
    setShowDropdown(false);
    onZoneChange(zone.zone_code);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredZones.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredZones.length) {
          handleZoneSelect(filteredZones[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[1 + highlightedIndex] as HTMLElement; // +1 for header
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="space-y-2 relative">
      <label htmlFor="zone-search" className="block text-sm font-medium text-terminal-accent">
        Marine Zone ({zones.length} available)
      </label>
      
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          id="zone-search"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search zones... (e.g., ANZ230, Boston Harbor, Cape Cod)"
          className="w-full p-3 bg-terminal-bg border border-terminal-border rounded focus:outline-none focus:ring-2 focus:ring-terminal-accent text-terminal-fg placeholder-terminal-muted font-mono"
          autoComplete="off"
        />
        
        {/* Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-terminal-muted">
          🔍
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-terminal-bg border border-terminal-border rounded shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredZones.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs text-terminal-muted border-b border-terminal-fg/20 bg-terminal-bg-alt">
                📍 {filteredZones.length} zone{filteredZones.length !== 1 ? 's' : ''} found • Use ↑↓ arrows to navigate, Enter to select
              </div>
              {filteredZones.map((zone, index) => (
                <div
                  key={zone.zone_code}
                  onClick={() => handleZoneSelect(zone)}
                  className={`px-3 py-3 cursor-pointer border-b border-terminal-fg/10 last:border-b-0 transition-colors ${
                    index === highlightedIndex 
                      ? 'bg-terminal-accent text-terminal-bg' 
                      : 'hover:bg-terminal-fg/10 text-terminal-fg'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium font-mono">
                        <span className={index === highlightedIndex ? 'text-terminal-bg' : 'text-terminal-success'}>
                          {zone.zone_code}
                        </span>
                      </div>
                      <div className={`text-sm truncate ${index === highlightedIndex ? 'text-terminal-bg/80' : 'text-terminal-muted'}`}>
                        {zone.location_name}
                      </div>
                    </div>
                    <div className={`text-xs ml-2 ${index === highlightedIndex ? 'text-terminal-bg/70' : 'text-terminal-muted'}`}>
                      {zone.synopsis_zone}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="px-3 py-6 text-center text-terminal-muted">
              <div className="text-lg mb-2">🔍</div>
              <div>No zones found matching</div>
              <div className="font-mono text-terminal-accent">"{inputValue}"</div>
              <div className="text-xs mt-2">Try searching by zone code (ANZ230) or location (Boston)</div>
            </div>
          )}
        </div>
      )}

      {/* Selected Zone Info */}
      {selectedZone && (
        <div className="text-xs text-terminal-muted border-t border-terminal-fg/20 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="text-terminal-accent font-semibold">Zone:</span> {selectedZone}
            </div>
            <div>
              <span className="text-terminal-accent font-semibold">Synopsis:</span> {zones.find(z => z.zone_code === selectedZone)?.synopsis_zone}
            </div>
          </div>
          {zones.find(z => z.zone_code === selectedZone)?.latitude && zones.find(z => z.zone_code === selectedZone)?.longitude && (
            <div className="mt-1">
              <span className="text-terminal-accent font-semibold">Coordinates:</span> {' '}
              {zones.find(z => z.zone_code === selectedZone)?.latitude?.toFixed(3)}°N, {' '}
              {Math.abs(zones.find(z => z.zone_code === selectedZone)?.longitude || 0).toFixed(3)}°W
            </div>
          )}
        </div>
      )}
    </div>
  );
}