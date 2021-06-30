import Knex from 'knex';
import 'dotenv/config';
import { SecretsCache, DbSecrets, JwtSecret, S3Secrets } from './helpers/secretsCache';
import AccountRepository from './domain/account/repository';
import AccountService from './domain/account/service';
import AuthenticationService from './domain/authentication/service';
import RoleRepository from './domain/role/repository';
import PermissionService from './domain/permission/service';
import RoleService from './domain/role/service';
import PermissionRepository from './domain/permission/repository';

const createContext = async () => {
  const secretsCache = new SecretsCache();
  const dbSecrets = new DbSecrets(secretsCache);
  const jwtSecret = new JwtSecret(secretsCache);
  const s3Secret = new S3Secrets(secretsCache);
  const knex = Knex({
    client: 'mysql',
    connection: await dbSecrets.getAsKnex(),
    pool: { min: 0, max: 7 },
    useNullAsDefault: true,
  });
  const accountRepository = new AccountRepository(knex);
  const accountService = new AccountService(accountRepository);
  const authenticationService = new AuthenticationService(accountService, jwtSecret);
  const roleRepository = new RoleRepository(knex);
  const roleService = new RoleService(roleRepository);
  const permissionRepository = new PermissionRepository(knex);
  const permissionService = new PermissionService(permissionRepository);

  return {
    secrets: {
      db: dbSecrets,
      jwt: jwtSecret,
      s3: s3Secret,
    },
    repositories: {
      account: accountRepository,
      role: roleRepository,
      permission: permissionRepository,
    },
    services: {
      account: accountService,
      authentication: authenticationService,
      role: roleService,
      permission: permissionService,
    },
  };
};

export default createContext;
