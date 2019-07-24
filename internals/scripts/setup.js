const shell = require('shelljs');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const compareVersions = require('compare-versions');
const chalk = require('chalk');

const animateProgress = require('./helpers/progress');
const addCheckMark = require('./helpers/checkmark');
const addXMark = require('./helpers/xmark');
const npmConfig = require('./helpers/get-npm-config');

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdout.write('\n');
let interval = -1;

/**
 * Deletes a file in the current directory
 * @param {string} file
 * @returns {Promise<any>}
 */
function deleteFileInCurrentDir(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(path.join(__dirname, file), err => reject(new Error(err)));
    resolve();
  });
}

/**
 * Checks if we are under Git version control
 * @returns {Promise<boolean>}
 */
function hasGitRepository() {
  return new Promise((resolve, reject) => {
    exec('git status', (err, stdout) => {
      if (err) {
        reject(new Error(err));
      }

      const regex = new RegExp(/fatal:\s+Not\s+a\s+git\s+repository/, 'i');

      /* eslint-disable-next-line no-unused-expressions */
      regex.test(stdout) ? resolve(false) : resolve(true);
    });
  });
}

/**
 * Checks if this is a clone from our repo
 * @returns {Promise<any>}
 */
function checkIfRepositoryIsAClone() {
  return new Promise((resolve, reject) => {
    exec('git remote -v', (err, stdout) => {
      if (err) {
        reject(new Error(err));
      }

      const isClonedRepo = stdout
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.startsWith('origin'))
        .filter(line => /react-boilerplate\/react-boilerplate\.git/.test(line))
        .length;

      resolve(!!isClonedRepo);
    });
  });
}

/**
 * Remove the current Git repository
 * @returns {Promise<any>}
 */
function removeGitRepository() {
  return new Promise((resolve, reject) => {
    try {
      shell.rm('-rf', '.git/');
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Ask user if he wants to start with a new repository
 * @returns {Promise<boolean>}
 */
function askUserIfWeShouldRemoveRepo() {
  return new Promise(resolve => {
    process.stdout.write(
      '\nDo you want to start with a new repository? [Y/n] ',
    );
    process.stdin.resume();
    process.stdin.on('data', pData => {
      const answer =
        pData
          .toString()
          .trim()
          .toLowerCase() || 'y';

      /* eslint-disable-next-line no-unused-expressions */
      answer === 'y' ? resolve(true) : resolve(false);
    });
  });
}

/**
 * Checks if we are under Git version control.
 * If we are and this a clone of our repository the user is given a choice to
 * either keep it or start with a new repository.
 * @returns {Promise<boolean>}
 */
async function cleanCurrentRepository() {
  const hasGitRepo = await hasGitRepository().catch(reason =>
    reportError(reason),
  );

  // We are not under Git version control. So, do nothing
  if (hasGitRepo === false) {
    return false;
  }

  const isClone = await checkIfRepositoryIsAClone().catch(reason =>
    reportError(reason),
  );

  // Not our clone so do nothing
  if (isClone === false) {
    return false;
  }

  const answer = await askUserIfWeShouldRemoveRepo();

  if (answer === true) {
    process.stdout.write('Removing current repository');
    await removeGitRepository().catch(reason => reportError(reason));
    addCheckMark();
  }

  return answer;
}
