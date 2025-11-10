/*
                                            _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| '_ ` _ \ / _ \/ __| '_ \| '_ \ / _ \ '__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                                 
                                     |_|                                                                                                                
    
    Written by: k3yomi@GitHub                        
*/

// ----------- Generic ----------- //

interface PlacefileLine { width: number; style: number; text: string; }
interface PlacefileObject { coordinates: [number, number];properties: { [key: string]: any }; }

// --- Exports --- //
export type PlacefileInput = {
    line?: PlacefileLine;
    coordinates?: Array<[number, number]>;
    object?: PlacefileObject;
    color?: { r: number; g: number; b: number; a: number };
    icon?: { x: number; y: number; color: string; scale: number; type: string; label: string };
}

export type placefileGeoInput = {
    type: string;
    features: Array<{
        type: string;
        geometry: Array<[number, number]> | [number, number];
        properties: { [key: string]: any };
    }>;
}

export interface PlacefileCreationInput { 
    refresh?: number;
    threshold?: number;
    title?: string;
    settings?: string;
    type?: string;
    data: string;
}

export type PlacefileOutput = PlacefileInput[];
export type PlacefileGeoOutput = placefileGeoInput;