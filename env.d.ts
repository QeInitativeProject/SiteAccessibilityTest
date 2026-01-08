declare namespace NodeJS {
  interface ProcessEnv {
    // Base URLs
    baseUrl: string;
    baseUrl_MU: string;
    muBaseUrl: string;

    // MU (Management Utility) Credentials
    muUsername: string;
    muPassword: string;
    muassessmentpassword: string;

    // Student Credentials - ZZ Dev Environment
    stuUsernamezzdev: string;
    stuUsernamezzdev1: string;
    stuUsernamezzdev2: string;
    stuUsernamezzdev3: string;
    stuUsernamezzdev4: string;
    stuPasswordzzdev: string;

    // Student Credentials - ZZ CAB Environment
    stuUsernamezzcab: string;
    stuPasswordzzcab: string;

    // Faculty Credentials - ZZ CAB Environment
    facUsernamezzcab: string;
    facPasswordzzcab: string;

    // Configuration
    Institution: string;
    Assessment: string;
    paidbookletcounts: string;

    // Environment Selection
    ENV?: 'qa' | 'stage' | 'prod';
  }
}
