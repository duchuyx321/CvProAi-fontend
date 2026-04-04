import CryptoJS from 'crypto-js';
export class helper {
    static hashValidate(text) {
        return CryptoJS.AES.encrypt(
            text,
            import.meta.env.VITE_SECRET_KEY,
        ).toString();
    }
    static decryptValidate(text) {
        const bytes = CryptoJS.AES.decrypt(
            text,
            import.meta.env.VITE_SECRET_KEY,
        );

        return bytes.toString(CryptoJS.enc.Utf8);
    }
}
