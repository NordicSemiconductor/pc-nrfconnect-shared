import { TaskEnd } from './sandboxTypes';

export const prepareExecNrfutilErrorMessage = <Result>(
    taskEnd: TaskEnd<Result>[]
) =>
    taskEnd
        .filter(end => end.result === 'fail')
        .map(
            end =>
                `error: Code '${end.error?.code}' ${end.error?.description}, message: ${end.message}`
        )
        .join('\n');

export const prepareExecNrfutilError = <Result>(
    error: Error,
    taskEnd: TaskEnd<Result>[],
    stdErr?: string
) => {
    let msg = error.message;

    const taskEndMsg = taskEnd
        .map(end => (end.message ? `Message: ${end.message}` : ''))
        .filter(message => !!message)
        .join('\n');

    if (taskEndMsg) {
        msg += `\n${taskEndMsg}`;
    }

    if (stdErr) {
        msg += `\nstdErr: ${stdErr}`;
    }

    error.message = msg;

    return error;
};
