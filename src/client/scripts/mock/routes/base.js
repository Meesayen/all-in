import { randomList } from './utils';
import { company as fakeCompany } from '../lib/faker';

export var testing = {
  success: () => ({
    message: 'Hey Dude, fucking A, it is working!',
    deeply: {
      nested: {
        key: 'wonderful'
      }
    }
  }),
  failure: () => ({
    message: 'Oh no, man, I am sorry. It looks broken.'
  })
};

export var one = () => ({
  greetings: 'ciao'
});

export var last = {
  success: () => ({
    message: 'Yes, it is really wonderful stuff.'
  }),
  failure: () => ({
    message: 'Broken!'
  })
};

export var awesomeList = {
  success: () => ({
    title: fakeCompany.companyName(),
    items: randomList(10, function() {
      return {
        label: fakeCompany.catchPhrase()
      };
    })
  }),
  failure: () => ({
    message: 'Broken!'
  })
};
