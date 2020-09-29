import { container } from 'tsyringe';
import { UserService } from '../services/user';

// TODO: if you want to register classes or values to be injected by tsyringe, you can register them in this file
container.register(UserService, { useValue: new UserService() });
