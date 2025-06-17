import {executeCommand} from 'trucker/lib/cli2.js';

export function simulateCLICommand(workDir, source, target) {
  // const li = [source, target];
  const args = Object.assign({
    '_': [source, target],
    'v': false,
    'version': false,
    'h': false,
    'help': false,
    'i': false,
    'info': false,
    'u': false,
    'unused': false,
    'm': true,
    'move': true,
    'n': false,
    'dry-run': false,
    '$0': 'node trucker',
  });
  executeCommand(args, workDir);
}

//simulateCLICommand(__dirname,'testfile.js', 'testdir');



