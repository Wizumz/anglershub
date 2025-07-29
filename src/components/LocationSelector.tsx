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
  const [showFallbackDropdown, setShowFallbackDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fallbackDropdownRef = useRef<HTMLDivElement>(null);

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
    setShowFallbackDropdown(false);
    onZoneChange(zone.zone_code);
    setHighlightedIndex(-1);
  };

  // Handle fallback dropdown selection
  const handleFallbackDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneCode = e.target.value;
    if (zoneCode) {
      const zone = zones.find(z => z.zone_code === zoneCode);
      if (zone) {
        handleZoneSelect(zone);
      }
    } else {
      setInputValue('');
      onZoneChange('');
    }
    setShowFallbackDropdown(false);
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

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Close autocomplete dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !inputRef.current?.contains(target)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
      
      // Close fallback dropdown
      if (
        fallbackDropdownRef.current &&
        !fallbackDropdownRef.current.contains(target)
      ) {
        setShowFallbackDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group zones by region for better organization in dropdown
  const groupedZones = zones.reduce((groups, zone) => {
    let region = 'Other';
    if (zone.zone_code.startsWith('ANZ1')) region = 'Maine / New Hampshire';
    else if (zone.zone_code.startsWith('ANZ2')) region = 'Massachusetts / Rhode Island';
    else if (zone.zone_code.startsWith('ANZ3')) region = 'New York / Connecticut';
    else if (zone.zone_code.startsWith('ANZ4')) region = 'New Jersey / Delaware';
    else if (zone.zone_code.startsWith('ANZ6')) region = 'Virginia / Chesapeake Bay';
    else if (zone.zone_code.startsWith('ANZ13') || zone.zone_code.startsWith('ANZ15')) region = 'North Carolina';
    else if (zone.zone_code.startsWith('AMZ1') || zone.zone_code.startsWith('AMZ2')) region = 'North Carolina / South Carolina';
    else if (zone.zone_code.startsWith('AMZ3') || zone.zone_code.startsWith('AMZ4')) region = 'South Carolina / Georgia';
    else if (zone.zone_code.startsWith('AMZ5') || zone.zone_code.startsWith('AMZ6')) region = 'Florida';
    
    if (!groups[region]) groups[region] = [];
    groups[region].push(zone);
    return groups;
  }, {} as Record<string, MarineZone[]>);

  return (
    <div className="space-y-2 relative">
      <div className="flex gap-2">
        {/* Smart Text Input */}
        <div className="flex-1 relative">
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

        {/* Fallback Dropdown Button */}
        <div className="relative" ref={fallbackDropdownRef}>
          <button
            onClick={() => setShowFallbackDropdown(!showFallbackDropdown)}
            className="px-3 py-2 bg-terminal-bg border border-terminal-border text-terminal-fg font-mono rounded hover:border-terminal-accent focus:outline-none focus:border-terminal-accent transition-colors"
            title="Browse all locations"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </button>

          {showFallbackDropdown && (
            <div className="absolute z-50 right-0 mt-1 w-96 bg-terminal-bg border border-terminal-border rounded shadow-lg max-h-80 overflow-y-auto">
              <div className="p-2 border-b border-terminal-border bg-terminal-border">
                <div className="text-xs text-terminal-muted font-mono">Browse All Locations</div>
              </div>
              
              <select
                value={selectedZone}
                onChange={handleFallbackDropdownChange}
                className="w-full bg-terminal-bg border-none text-terminal-fg font-mono text-sm p-2 focus:outline-none"
                size={12}
              >
                <option value="">Select a marine zone...</option>
                {Object.entries(groupedZones).map(([region, regionZones]) => (
                  <optgroup key={region} label={region} className="text-terminal-accent font-bold">
                    {regionZones.map((zone) => (
                      <option key={zone.zone_code} value={zone.zone_code} className="text-terminal-fg">
                        {zone.zone_code} - {zone.location_name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              
              <div className="p-2 border-t border-terminal-border text-xs text-terminal-muted text-center">
                {zones.length} zones available
              </div>
            </div>
          )}
        </div>
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