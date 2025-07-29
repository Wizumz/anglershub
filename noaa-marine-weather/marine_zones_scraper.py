import csv
import requests
import re

# URL to the NWS Public Forecast Zones ASCII file (replace with actual URL)
DATA_URL = "https://www.weather.gov/source/gis/ShapeFiles/z_290725.dbx"  # Example URL, update as needed

# Output CSV file
OUTPUT_CSV = "marine_zones.csv"

# Marine zone prefixes
MARINE_PREFIXES = ('ANZ', 'AMZ', 'GMZ', 'PMZ', 'OZ', 'HZ')

def download_file(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text.splitlines()
    except requests.RequestException as e:
        print(f"Error downloading file: {e}")
        return None

def parse_zones(data_lines):
    marine_zones = []
    for line in data_lines:
        # Skip empty lines or headers
        if not line or line.startswith('#'):
            continue
        # Split pipe-delimited line
        fields = line.split('|')
        if len(fields) < 4:
            continue
        zone_code = fields[0].strip()
        # Check if it's a marine zone
        if any(zone_code.startswith(prefix) for prefix in MARINE_PREFIXES):
            location_name = fields[1].strip()
            # Synopsis zone may not always be explicitly listed; infer from forecast text if needed
            synopsis_zone = fields[3].strip() if len(fields) > 3 else ''
            # Clean up location name (remove extra spaces, etc.)
            location_name = re.sub(r'\s+', ' ', location_name)
            marine_zones.append({
                'zone_code': zone_code,
                'location_name': location_name,
                'synopsis_zone': synopsis_zone
            })
    return marine_zones

def write_to_csv(zones, output_file):
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['zone_code', 'location_name', 'synopsis_zone'])
        writer.writeheader()
        for zone in zones:
            writer.writerow(zone)

def main():
    # Download the file
    data_lines = download_file(DATA_URL)
    if not data_lines:
        print("Failed to download data. Please check the URL or try the sample data.")
        return
    
    # Parse marine zones
    marine_zones = parse_zones(data_lines)
    
    # Write to CSV
    write_to_csv(marine_zones, OUTPUT_CSV)
    print(f"Marine zones written to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()