import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service'; 
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto'; 
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '../user-role.enum';

describe('UsersService - Unit', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockUsers: User[] = [
    { 
        id: 1,
        name:'User One',
        email: 'one@test.com',
        password: 'pass1',
        role:UserRole.CLIENT,
        orders: [],
    deliveries: [],
    },
    {
        id: 2,
        name: 'User Two',
        email: 'two@test.com',
        password: 'pass2',
        role: UserRole.DRIVER,
        orders: [],
    deliveries: [],
    },
  ];

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(user => Promise.resolve({ id: Date.now(), ...user })),
    find: jest.fn().mockResolvedValue(mockUsers),
    findOneBy: jest.fn().mockImplementation(({ id }) => {
      const user = mockUsers.find(u => u.id === id);
      return Promise.resolve(user);
    }),
    delete: jest.fn().mockImplementation(id => {
      const exists = mockUsers.some(u => u.id === id);
      return Promise.resolve({ affected: exists ? 1 : 0 });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ✅ createUser
  it('should create a user', async () => {
    const dto: CreateUserDto = {
      name: 'New User',
      email: 'new@test.com',
      password: '123456',
      role: UserRole.CLIENT,
    };

    const result = await service.createUser(dto);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
    expect(result.name).toEqual(dto.name);
  });

  // ✅ findAll
  it('should return all users', async () => {
    const users = await service.findAll();
    expect(users).toEqual(mockUsers);
    expect(mockRepository.find).toHaveBeenCalled();
  });

  // ✅ findOne
  it('should return a user by id', async () => {
    const user = await service.findOne(1);
    expect(user).toEqual(mockUsers[0]);
  });

  it('should throw NotFoundException if user not found', async () => {
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  // ✅ updateUser
  it('should update user', async () => {
    const updatedUser = { ...mockUsers[0], name: 'Updated Name' };
    jest.spyOn(repo, 'findOneBy').mockResolvedValueOnce(mockUsers[0]);
    jest.spyOn(repo, 'save').mockResolvedValueOnce(updatedUser);

    const result = await service.updateUser(1, { name: 'Updated Name' });
    expect(result.name).toEqual('Updated Name');
  });

  // ✅ deleteUser
  it('should delete user', async () => {
    const result = await service.deleteUser(1);
    expect(result).toEqual({ message: `User with id 1 has been deleted` });
  });

  it('should throw NotFoundException if user not found for delete', async () => {
    await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
  });
});
