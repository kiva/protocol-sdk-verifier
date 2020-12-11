class AuthService {
    private authToken?: string;

    static init(): AuthService {
        return new AuthService();
    }

    setToken(token: string): void {
        this.authToken = token;
        this.setToken = (token: string) => {};
    }

    getToken(): string {
        return this.authToken || "";
    }
}

const auth: AuthService = AuthService.init();

export default auth;
