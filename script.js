'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const errorContainer = document.querySelector('.error');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//---------------------------------------------------------------------------------
//---------------------------------------------------------------displayMovements
const displayMovements = function (account) {
  if (!account) {
    return;
  }

  const movementsToDisplay = SortMovements
    ? [...account.movements].sort((prev, next) => prev - next)
    : account.movements;

  containerMovements.textContent = '';
  movementsToDisplay.forEach((movement, index) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const movmentUI = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      index + 1
    } deposit</div>
          <div class="movements__date">3 days ago</div>
          <div class="movements__value">${movement}€</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', movmentUI);
  });
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------UserName Creator
const createUserNames = accounts => {
  accounts.forEach(
    acc =>
      (acc.username = acc.owner
        .toLocaleLowerCase()
        .split(' ')
        .map(word => word.slice(0, 1))
        .join(''))
  );
};
createUserNames(accounts);

//---------------------------------------------------------------------------------
//---------------------------------------------------------------calcDisplayBalance

const calcDisplayBalance = account => {
  if (!account) {
    return;
  }
  const balance = account.movements.reduce(
    (acc, movement) => acc + movement,
    0
  );

  account.balance = balance;
  labelBalance.textContent = balance + '€';
};

//---------------------------------------------------------------------------------
//---------------------------------------------------------------calDisplaySummary

const calDisplaySummary = account => {
  if (!account) {
    return;
  }
  const incomes = account.movements
    .filter(movement => movement > 0)
    .reduce((acc, income) => acc + income, 0);

  const outcomes = account.movements
    .filter(movement => movement < 0)
    .reduce((acc, income) => acc + income, 0);

  labelSumIn.textContent = `${incomes}€`;
  labelSumOut.textContent = `${Math.abs(outcomes)}€`;

  const intrest = account.movements
    .filter(movement => movement > 0)
    .reduce((acc, income) => acc + (income * account.interestRate) / 100, 0);

  labelSumInterest.textContent = `${intrest}€`;
};

//---------------------------------------------------------------------------------
//--------------------------------------------------------------- LOG-IN
let CurrentAccount;

const logInHandler = e => {
  e.preventDefault();
  errorContainer.style.display = 'none';
  const userNameInput = inputLoginUsername.value;
  const pinInput = +inputLoginPin.value;

  CurrentAccount = accounts.find(acc => acc.username === userNameInput);

  if (CurrentAccount?.pin === pinInput) {
    // Display UI and message
    containerApp.style.opacity = '1';
    labelWelcome.innerHTML = `Welcome back <span>${
      CurrentAccount.owner.split(' ')[0]
    }</span> `;

    //Clear Inputs
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();
    refreshUI();
  } else {
    errorContainer.style.display = 'flex';
  }
};

btnLogin.addEventListener('click', logInHandler);

//---------------------------------------------------------------------------------
//--------------------------------------------------------------- Transfer

const transferHandler = e => {
  e.preventDefault();
  const amountToSend = +inputTransferAmount.value;
  const receiverName = inputTransferTo.value;

  const receiverfound = accounts.find(user => user.username === receiverName);

  if (amountToSend > 0 && receiverfound?.username !== CurrentAccount.username) {
    if (CurrentAccount.balance >= amountToSend) {
      CurrentAccount.movements.push(-amountToSend);
      receiverfound.movements.push(amountToSend);

      refreshUI();
    }
  }

  inputTransferAmount.value = inputTransferTo.value = '';
};

btnTransfer.addEventListener('click', transferHandler);

//---------------------------------------------------------------------------------
//--------------------------------------------------------------- Refrech UI

const refreshUI = () => {
  displayMovements(CurrentAccount);
  calDisplaySummary(CurrentAccount);
  calcDisplayBalance(CurrentAccount);
};

//---------------------------------------------------------------------------------
//--------------------------------------------------------------- DELETE ACCOUNT

const accountDeleteHandler = e => {
  e.preventDefault();

  const usernameToDelete = inputCloseUsername.value;
  const pinTodelete = +inputClosePin.value;

  const TargetUserIndex = accounts.findIndex(
    acc => acc.username === usernameToDelete
  );

  if (
    TargetUserIndex > -1 &&
    accounts[TargetUserIndex].pin === pinTodelete &&
    usernameToDelete === CurrentAccount.username
  ) {
    //set currentAccount to Null;
    CurrentAccount = null;
    // refresh the UI
    refreshUI();
    // welcome message reset
    labelWelcome.textContent = 'Log in to get started';
    // opacity to zero
    containerApp.style.opacity = 0;

    //remove the user from the array
    accounts.splice(TargetUserIndex, 1);
  }

  console.log('clicked');
};

btnClose.addEventListener('click', accountDeleteHandler);

//---------------------------------------------------------------------------------
//--------------------------------------------------------------- REQUEST A LOAN

const requestLoanHandler = e => {
  e.preventDefault();

  const loanValue = +inputLoanAmount.value;

  if (loanValue > 0) {
    const legible = CurrentAccount.movements.some(
      movement => movement >= (loanValue * 10) / 100
    );
    if (legible) {
      setTimeout(() => {
        CurrentAccount.movements.push(loanValue);

        refreshUI();
      }, 1000);
    }
  }

  inputLoanAmount.value = '';
};

btnLoan.addEventListener('click', requestLoanHandler);

//---------------------------------------------------------------------------------
//--------------------------------------------------------------- SORTING
let SortMovements = false;

const sortingHandler = () => {
  SortMovements = !SortMovements;
  refreshUI();
};

btnSort.addEventListener('click', sortingHandler);

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

/////////////////////////////////////////////////
