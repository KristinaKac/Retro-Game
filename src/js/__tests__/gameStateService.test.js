import GameStateService from '../GameStateService';

jest.mock('../GameStateService');

beforeEach(() => {
  jest.resetAllMocks();
});
test('successful loading of load method', () => {
  const stateService = new GameStateService();
  const result = {
    level: 1, attack: 25, defence: 25, health: 100, type: 'bowman',
  };
  stateService.load.mockReturnValue(result);
  expect(stateService.load()).toBe(result);
});
test('method failed to load', () => {
  const stateService = new GameStateService(null);
  stateService.load = jest.fn(() => { throw new Error('Invalid state'); });
  expect(() => stateService.load()).toThrowError(new Error('Invalid state'));
});
