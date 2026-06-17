declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginResult {
      code: string;
      department?: string;
      roleMenu?: string[];
      buttons?: string[];
      name: string;
      disableFlag?: boolean;
      kbToken: string;
    }

    interface LoginToken {
      token: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }
  }
}
