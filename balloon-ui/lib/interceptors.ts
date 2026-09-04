// Token httpOnly não é acessível via JS: o header Authorization agora é
// injetado no servidor pelo BFF (app/api/[...path]/route.ts), não aqui.