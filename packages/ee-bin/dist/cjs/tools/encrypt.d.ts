type TargetType = 'frontend' | 'electron';
interface EncryptOptions {
    config?: string;
    out?: string;
    target?: TargetType;
}
declare function encrypt(options?: EncryptOptions): void;
declare function cleanEncrypt(options?: {
    dir?: string | string[];
}): void;
export { encrypt, cleanEncrypt, };
