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
  return (
    <div className="space-y-2">
      <select
        value={selectedZone}
        onChange={(e) => onZoneChange(e.target.value)}
        className="w-full bg-terminal-bg border border-terminal-border text-terminal-fg font-mono p-2 rounded focus:outline-none focus:border-terminal-accent"
      >
        <option value="">Select a marine zone...</option>
        {zones.map((zone) => (
          <option key={zone.zone_code} value={zone.zone_code}>
            {zone.zone_code} - {zone.location_name}
          </option>
        ))}
      </select>
      
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