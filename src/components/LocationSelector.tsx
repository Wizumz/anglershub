import { useState, useEffect, useRef } from 'react';

interface MarineZone {
  zone_code: string;
  location_name: string;
  synopsis_zone: string;
}

interface LocationSelectorProps {
  zones: MarineZone[];
  selectedZone: string;
  onZoneChange: (zone: string) => void;
}

export default function LocationSelector({ zones, selectedZone, onZoneChange }: LocationSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredZones, setFilteredZones] = useState<MarineZone[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update input value when selectedZone changes
  useEffect(() => {
    if (selectedZone) {
      const zone = zones.find(z => z.zone_code === selectedZone);
      if (zone) {
        setInputValue(`${zone.zone_code} - ${zone.location_name}`);
      }
    } else {
      setInputValue('');
    }
  }, [selectedZone, zones]);

  // Filter zones based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredZones([]);
      setShowDropdown(false);
      return;
    }

    const searchTerm = inputValue.toLowerCase();
    const filtered = zones.filter(zone => 
      zone.zone_code.toLowerCase().includes(searchTerm) ||
      zone.location_name.toLowerCase().includes(searchTerm)
    );
    
    setFilteredZones(filtered);
    setShowDropdown(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [inputValue, zones]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear selection if input doesn't match current selection
    if (selectedZone) {
      const currentZone = zones.find(z => z.zone_code === selectedZone);
      if (currentZone && value !== `${currentZone.zone_code} - ${currentZone.location_name}`) {
        onZoneChange('');
      }
    }
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
          prev < filteredZones.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredZones.length - 1
        );
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
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredZones.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder="Type to search marine zones (e.g., 'Long Isl', 'Boston', 'ANZ230')..."
          className="w-full bg-terminal-bg border border-terminal-border text-terminal-fg font-mono p-2 rounded focus:outline-none focus:border-terminal-accent"
        />
        
        {showDropdown && filteredZones.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-terminal-bg border border-terminal-border rounded shadow-lg max-h-64 overflow-y-auto"
          >
            {filteredZones.slice(0, 10).map((zone, index) => (
              <div
                key={zone.zone_code}
                onClick={() => handleZoneSelect(zone)}
                className={`p-2 cursor-pointer font-mono text-sm border-b border-terminal-border last:border-b-0 ${
                  index === highlightedIndex
                    ? 'bg-terminal-accent text-terminal-bg'
                    : 'text-terminal-fg hover:bg-terminal-border'
                }`}
              >
                <div className="font-bold text-terminal-accent">
                  {zone.zone_code}
                </div>
                <div className="text-xs text-terminal-muted truncate">
                  {zone.location_name}
                </div>
              </div>
            ))}
            {filteredZones.length > 10 && (
              <div className="p-2 text-xs text-terminal-muted text-center border-t border-terminal-border">
                Showing first 10 of {filteredZones.length} results
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedZone && (
        <div className="text-terminal-muted text-sm mt-2">
          <div>Zone: <span className="text-terminal-accent">{selectedZone}</span></div>
          <div>
            Location: <span className="text-terminal-fg">
              {zones.find(z => z.zone_code === selectedZone)?.location_name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}