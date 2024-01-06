declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT?: number;
      MONGO_URI:string;
      GEOCODER_PROVIDER:string;
      GEOCODER_API_KEY:string;
      FILE_UPLOAD_PATH:string;
      MAX_FILE_UPLOAD:number
      JWT_SECRET:string;
      JWT_EXPIRE:string;
      JWT_COOKIE_EXPIRE:number;
      SMTP_HOST:string;
      SMTP_PORT:number
      SMTP_EMAIL:string;
      SMTP_PASSWORD:string;
      FROM_EMAIL:string;
      FROM_NAME:string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
  