import {exec, execSync} from 'child_process';

export async function execCommandAsync(dir, command) {
    exec(command, {cwd: dir}, (error, stdout, stderr) => {
        if (error) {
            console.error(`An error occurred: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

export function execCommandSync(dir, command) {
    return execSync(command, {cwd: dir});
}
