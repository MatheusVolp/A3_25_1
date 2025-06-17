// functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// 1. POST: Criar uma nova senha
exports.createPassword = functions.https.onCall(async (data, context) => {
    // Verifica se o usuário está autenticado
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'A solicitação deve ser autenticada.'
        );
    }

    const uid = context.auth.uid;
    const { passwordValue, description } = data; // Você pode enviar mais campos, como uma descrição

    if (!passwordValue) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'O valor da senha é obrigatório.'
        );
    }

    try {
        const newPasswordRef = await db.collection('users').doc(uid).collection('passwords').add({
            passwordValue: passwordValue,
            description: description || 'Sem descrição',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            userId: uid // Para garantir que o dado está linkado ao usuário
        });
        return { id: newPasswordRef.id, message: 'Senha salva com sucesso!' };
    } catch (error) {
        throw new functions.https.HttpsError(
            'unknown',
            'Erro ao salvar a senha.',
            error.message
        );
    }
});

// 2. GET: Listar senhas do usuário
exports.getPasswords = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'A solicitação deve ser autenticada.'
        );
    }

    const uid = context.auth.uid;

    try {
        const snapshot = await db.collection('users').doc(uid).collection('passwords').orderBy('createdAt', 'desc').get();
        const passwords = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return passwords;
    } catch (error) {
        throw new functions.https.HttpsError(
            'unknown',
            'Erro ao buscar as senhas.',
            error.message
        );
    }
});

// 3. PUT/PATCH: Atualizar uma senha existente
exports.updatePassword = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'A solicitação deve ser autenticada.'
        );
    }

    const uid = context.auth.uid;
    const { passwordId, passwordValue, description } = data;

    if (!passwordId || (!passwordValue && !description)) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'ID da senha e dados para atualização são obrigatórios.'
        );
    }

    try {
        const passwordRef = db.collection('users').doc(uid).collection('passwords').doc(passwordId);
        await passwordRef.update({
            passwordValue: passwordValue,
            description: description,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { message: 'Senha atualizada com sucesso!' };
    } catch (error) {
        throw new functions.https.HttpsError(
            'unknown',
            'Erro ao atualizar a senha.',
            error.message
        );
    }
});

// 4. DELETE: Deletar uma senha
exports.deletePassword = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'A solicitação deve ser autenticada.'
        );
    }

    const uid = context.auth.uid;
    const { passwordId } = data;

    if (!passwordId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'ID da senha é obrigatório para exclusão.'
        );
    }

    try {
        await db.collection('users').doc(uid).collection('passwords').doc(passwordId).delete();
        return { message: 'Senha deletada com sucesso!' };
    } catch (error) {
        throw new functions.https.HttpsError(
            'unknown',
            'Erro ao deletar a senha.',
            error.message
        );
    }
});