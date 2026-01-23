/*
                                            _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| "_ ` _ \ / _ \/ __| "_ \| "_ \ / _ \ "__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                                 
                                     |_|                                                                                                                
    
    Written by: KiyoWx (k3yomi)                
*/

import * as types from './types';

export class PlacefileManager { 
    
    /**
     * @function parsePlacefile
     * @description
     *     Parses a Placefile string and returns an array of PlacefileInput objects.
     *
     * @param data - The Placefile string to be parsed.
     */
    static async parsePlacefile(data: string): Promise<types.PlacefileInput[]> {
        let objects = [];
        let currentObject: types.PlacefileInput = {};
        const lines = data.split(/\r?\n/) as any;
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('//')) {
                continue; 
            }
            if (line.startsWith('Line:')) {
                const parts = line.replace(`Line:`, '').trim().split(',')
                currentObject.line = { 
                    width: parseFloat(parts[0]), 
                    style: parseFloat(parts[1]), 
                    text: parts.slice(2).join(',').trim() 
                }
                currentObject.coordinates = []
            }
            if (line.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
                const coords = line.split(',')
                if (currentObject.coordinates) { 
                    currentObject.coordinates.push([parseFloat(coords[1]), parseFloat(coords[0])]) 
                }
            }
            if (line.startsWith('Object:')) {
                const coordinates = line.replace(`Object:`, '').trim().split(',')
                currentObject.object = {  
                    coordinates: [parseFloat(coordinates[1]), parseFloat(coordinates[0])], 
                    properties: {} 
                }
            }
            if (line.startsWith('Color:')) {
                const parts = line.replace(`Color:`, '').trim().split(' ')
                currentObject.color = { 
                    r: parseInt(parts[0]), 
                    g: parseInt(parts[1]), 
                    b: parseInt(parts[2]), 
                    a: parseFloat(parts[3]) 
                }
            }
            if (line.startsWith('Icon:')) {
                const parts = line.replace(`Icon:`, '').trim().split(',')
                currentObject.icon = { 
                    x: parseFloat(parts[0]), 
                    y: parseFloat(parts[1]),
                    scale: parseFloat(parts[3]),  
                    color: parts[2], 
                    type: parts[4], 
                    label: parts.slice(5).join(',').trim().replace(/^"|"$/g, '') 
                }
            }
            if (line.startsWith('End:') && currentObject && Object.keys(currentObject).length > 0) {
                objects.push(currentObject);
                currentObject = {}
            }
            if (!lines.includes('End:') && currentObject && Object.keys(currentObject).length > 0) {
                objects.push(currentObject); 
                currentObject = {} 
            }
        }
        return objects;
    }

    
    /**
     * @function parseTable
     * @description
     *     Parses a table-formatted string and returns an array of objects.
     *
     * @param data - The table-formatted string to be parsed.
     */
    static async parseTable(data: string): Promise<any[]> {
        let lines = data.split(/\r?\n/)
        let objects = []
        let dict = lines[0].split('|').map((key) => key.trim())
        for (let line of lines.slice(1)) {
            line = line.trim()
            if (!line || line.startsWith('//')) { continue }
            if (line.includes('|')) {
                const parts = line.split('|')
                let obj: any = {}
                for (let i = 0; i < dict.length; i++) { obj[dict[i]] = parts[i] ? parts[i].trim() : `N/A` }
                objects.push(obj)
            }
        }
        return objects
    }

    /**
     * @function parseGeoJSON
     * @description
     *     Parses a GeoJSON string and returns an array of PlacefileGeoOutput objects.
     *
     * @param data - The GeoJSON string to be parsed.
     */
    static async parseGeoJSON(data: string): Promise<types.PlacefileGeoOutput[] | string> {
        let geojson: types.placefileGeoInput
        try { geojson = (typeof data === 'string') ? JSON.parse(data) : data }
        catch (e) { return "Invalid JSON format" }
        if (!geojson || !geojson.type || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
            return "Invalid GeoJSON format"
        }   
        let features = geojson.features.map((feature: any) => {
            let geometry = feature.geometry || {}
            let properties = feature.properties || {}
            let parsedFeature: any = { type: geometry.type || 'N/A', coordinates: geometry.coordinates || [], properties: properties }
            return parsedFeature
        })
        return features
    }

    /**
     * @function createPlacefile
     * @description
     *     Creates a Placefile string from the provided PlacefileCreationInput data.
     *
     * @param data
     * - refresh: The refresh interval for the Placefile.
     * - threshold: The threshold value for the Placefile.
     * - title: The title of the Placefile.
     * - settings: Additional settings for the Placefile.
     * - type: The type of Placefile to create ('point' or other).
     * - data: An array of data objects to include in the Placefile.
     */
    static async createPlacefile(data: types.PlacefileCreationInput): Promise<string> { 
        let placefileText = `Refresh: ${data?.refresh ?? `60`}\nThreshold: ${data?.threshold ?? 9999}\nTitle: ${data?.title ?? `No Tile`}\n${data?.settings ?? ``}\n`
        if (data?.type === 'point') {
            for (let item of data?.data) {
                let { description = `No description provided`, point = [], icon = '0,0,000,1,19', text = '0, 15, 1', title = '' } = (item as any) || {};
                if (Array.isArray(point) && point.length == 2 && typeof point[0] == 'number' && typeof point[1] == 'number') {
                    placefileText += [ `\nObject: ${point[1]},${point[0]}`, `Icon: ${icon},"${description.replace(/\n/g, '\\n')}"`, `Text: ${text}, "${title.split('\n')[0]}"`, `End:\n` ].join('\n');
                }
            }
        } else {
            for (let item of data?.data) {
                let { description = `No description provided`, polygon = [], rgb = `255,255,255,255` } = (item as any) || {};
                rgb = rgb.replace(/,/g, ' ');
                let hasCoords = Array.isArray(polygon) && polygon.some(ring => Array.isArray(ring) && ring.some(pt => Array.isArray(pt) && pt.length == 2 && typeof pt[0] == 'number' && typeof pt[1] == 'number'));
                if (!hasCoords) continue;
                placefileText += `\nColor: ${rgb}\n\nLine: 3,0, ${description}\n`;
                for (let ring of polygon) {
                    for (let pt of ring) {
                        if (Array.isArray(pt) && pt.length == 2) { placefileText += `${pt[1]},${pt[0]}\n`; }
                    }
                }
                placefileText += `End:\n`;
            }
        }
        return placefileText.trim();
    }
}

export default PlacefileManager;