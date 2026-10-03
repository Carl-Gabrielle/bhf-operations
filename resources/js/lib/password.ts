export function generateTemporaryPassword(length = 14): string {
    if (length < 4) {
        throw new Error(
            'Temporary password length must be at least 4 characters.',
        );
    }

    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*_-+=';
    const all = uppercase + lowercase + numbers + symbols;

    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);

    const password = Array.from(
        values,
        (value) => all[value % all.length],
    );

    password[0] = uppercase[values[0] % uppercase.length];
    password[1] = lowercase[values[1] % lowercase.length];
    password[2] = numbers[values[2] % numbers.length];
    password[3] = symbols[values[3] % symbols.length];

    return password.join('');
}
