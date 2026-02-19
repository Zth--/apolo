
// Crypto Utils
const hexToBuf = (hex) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes.buffer;
};

async function decrypt(encryptedStr, password) {
    try {
        const [saltHex, ivHex, authTagHex, dataHex] = encryptedStr.split(':');

        const salt = hexToBuf(saltHex);
        const iv = hexToBuf(ivHex);
        const authTag = hexToBuf(authTagHex);
        const data = hexToBuf(dataHex);

        // Combine data and authTag for Web Crypto API
        const ciphertext = new Uint8Array(data.byteLength + authTag.byteLength);
        ciphertext.set(new Uint8Array(data), 0);
        ciphertext.set(new Uint8Array(authTag), data.byteLength);

        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const key = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["decrypt"]
        );

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error(e);
        throw new Error('Decryption failed');
    }
}

// Decoding Effect
function scrambleText(element, finalHtml) {
    // Create a temporary container to parse the HTML and get text nodes
    const temp = document.createElement('div');
    temp.innerHTML = finalHtml;

    // We will replace the element's content with the final HTML immediately, 
    // but we will "hide" the text and reveal it with the effect.
    // Actually, a simpler approach for HTML content:
    // Just fade it in, but apply the effect to specific text blocks if possible.
    // For now, let's just do a simple "matrix reveal" on the whole container text if it was plain text,
    // but since it's HTML, we have to be careful not to break tags.

    // Alternative: Just set the HTML and animate opacity/glitch.
    // But user asked for "replacing letters".

    // Let's try to traverse text nodes.
    element.innerHTML = finalHtml;
    const textNodes = [];

    function walk(node) {
        if (node.nodeType === 3) { // Text node
            textNodes.push(node);
        } else {
            for (let child of node.childNodes) {
                walk(child);
            }
        }
    }
    walk(element);

    textNodes.forEach(node => {
        const originalText = node.nodeValue;
        if (!originalText.trim()) return;

        let iterations = 0;
        const maxIterations = 20;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';

        const interval = setInterval(() => {
            node.nodeValue = originalText
                .split('')
                .map((letter, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iterations >= originalText.length) {
                clearInterval(interval);
                node.nodeValue = originalText; // Ensure final state is clean
            }

            iterations += 1 / 2; // Speed control
        }, 30);
    });
}

// Init Logic for Encrypted Pages
document.addEventListener('DOMContentLoaded', () => {
    const lockContainer = document.getElementById('lock-container');
    const contentContainer = document.getElementById('blog-content');
    const passwordInput = document.getElementById('password-input');
    const unlockBtn = document.getElementById('unlock-btn');
    const errorMsg = document.getElementById('error-msg');

    if (lockContainer && contentContainer) {
        const encryptedData = contentContainer.getAttribute('data-encrypted');

        // Show the encrypted data as "ciphertext" initially
        contentContainer.textContent = encryptedData;

        const tryUnlock = async () => {
            const password = passwordInput.value;
            if (!password) return;

            unlockBtn.textContent = 'DECRYPTING...';
            errorMsg.classList.remove('visible');

            try {
                // Add a fake delay for dramatic effect
                await new Promise(r => setTimeout(r, 200));

                const decryptedHtml = await decrypt(encryptedData, password);

                // Hide lock container
                lockContainer.style.display = 'none';

                // Remove ciphertext class and update content
                contentContainer.classList.remove('ciphertext');
                scrambleText(contentContainer, decryptedHtml);

            } catch (e) {
                unlockBtn.textContent = 'UNLOCK';
                errorMsg.textContent = 'ACCESS DENIED: INVALID KEY';
                errorMsg.classList.add('visible');
                passwordInput.value = '';
                passwordInput.focus();
            }
        };

        unlockBtn.addEventListener('click', tryUnlock);
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') tryUnlock();
        });
    }
});
