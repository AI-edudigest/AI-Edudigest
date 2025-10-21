export interface College {
  name: string;
  shortName: string;
  type: string;
  affiliation: string;
  location: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
}

export declare function loadColleges(): Promise<College[]>;
export declare function searchColleges(colleges: College[], searchTerm: string, limit?: number): College[];
