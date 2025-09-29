The folder `ipc/` is meant as a middle layer between the main and renderer
processes.

Some of the code here should be called from the main process, usually to
register IPC handlers. Other code here should be called from the renderer
process(es), usually the ones to send IPC messages. They are both kept together
to keep them in sync, especially that the channel names and the shape of the
messages are the same.

All the code for the main process here is ran by the launcher. The launcher or
apps can invoke the functions from here, e.g. to do things like opening an app.
This means, the API must be kept stable here and in the launcher, so that the
launcher will react in the way the apps expect it.

## Code conventions

There are a few conventions we follow with the code here in `ipc/`:

- In each file there are pairs of functions: One to send a message over an IPC
  channel (e.g. `openApp`) and another to register a handler for the messages on
  that same channel (e.g. `registerOpenApp`).

    Usually these two functions utilize a shared signature which is defined in a
    type above them. Usually the functions are defined by invoking functions
    from `infrastructure/mainToRenderer.ts` or
    `infrastructure/rendererToMain.ts` which also use that type.

- The functions mentioned before are then exported in objects with the names
  `inMain`, `forRenderer`, `inRenderer`, and `forMain` to signify how the
  functions are supposed to be used. E.g. the mentioned `openApp` is in `inMain`
  because it is called by code in the renderer processes to invoke code in the
  main process to open an window. `registerOpenApp` is in `forRenderer` because
  the handler is registered so that code in the renderer processes can invoke
  it.

    So, `inMain` and `forRenderer` are used when sending messages from the
    renderer processes to the main process. `inRenderer` and `forMain` are used,
    when sending messages from the main process to the renderer processes.

- The code here in `ipc/` must neither reference any code in `src/` (which is
  for code of the renderer processes) nor in `main/` (which is for code in the
  main process). Only the other way around code in those two folders can
  reference code in `ipc/`.
