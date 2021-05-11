# Agent Classes

Verification of credentials mostly follows the same steps.

1. Invite another party to establish a connection.
2. Wait for the connection invitation to be accepted.
3. Send a verification request to the connected party.
4. Prove the validity of the credentials.

Because there's a predictable flow, we have created a `BaseAgent` class and an `IAgent` implementation to make sure that it is as easy as possible to implement your own agent seamlessly into the existing UI. (You can see the React component that consumes the `IAgent` classes in `AgencyQR.tsx` [here](https://github.com/kiva/protocol-sdk-verifier/blob/master/src/ui/screens/AgencyQR.tsx)).

## How To Use These

First step is to create a new Typescript file that exports a class that implements the `IAgent` interface. We also recommend extending the `BaseAgent` class, but this isn't strictly speaking necessary.

```
import BaseAgent from './BaseAgent';

import {IAgent} from '../interfaces/AgentInterfaces';

export default class NewAgent extends BaseAgent implements IAgent {}
```

The `IAgent` interface requires the following methods:

* `establishConnection`: This asynchronous method accepts a connection ID string and returns a connection invitation object as a `Promise<any>`
* `getConnection`: This asynchronous method accepts a connection ID string and returns a connection status object as a `Promise<any>`
* `sendVerification`: This asynchronous method accepts a connection ID string and proof profile object and returns a verification ID string wrapped in a Promise
* `checkVerification`: This asynchronous method accepts a verification ID string and returns a verification status object as a `Promise<any>`
* `isConnected`: This method accepts a connection status object and returns a boolean that indicates whether the connection is in an "Accepted" state.
* `isVerified`: Similar to `isConnected`, this method accepts a verification status object and returns a boolean indicating whether the proof has succeeded.
* `formatProof`: This method allows you to modify the schema of the proven verification in order to be rendered in the UI. If you don't want to do any modfications, simply return the `response` provided as a parameter.
* `getProof`: This method is used to determine what part of the verified proof object to return to the UI.

The `BaseAgent`, while not required, provides some helpful methods to make writing your connection and verification methods easier.

For example, to create a new `establishConnection` method with the `BaseAgent`, you could simply write:

```
establishConnection = async (connectionId: string) => {
    return super.establish(
        fetch(whateverURL.org),
        (data: any) => { return data; }
    );
}
```

For an explanation of why this works, you can read the documentation on the `BaseAgent` below.

Once you've completed your `NewAgent` class, you then have to implement it. There are easy ways to do this and fancier ways, but this example will use the easiest way possible.

1. Copy the object at index 0 of the `verification_options` array in [`get_started.json`](https://github.com/kiva/protocol-sdk-verifier/blob/master/config/get_started.json) and add a new object to the array.
2. Modify the `id`, `title` and `description` keys so that they refer to your new agent. There's no restriction on what values you can use for these keys.
3. Use the `id` you defined in Step 2 and add a new case to the switch statement in the `determineCloudAgent` method [here](https://github.com/kiva/protocol-sdk-verifier/blob/master/src/ui/screens/AgencyQR.tsx).

Once finished, you should be able to run the app and select your new agent after Accepting the consent.

## `BaseAgent`

This base class provides a series of utility functions that invoke the `baseFunction`, which accepts a promise, a data manipulation function, and optionally a predetermined error string.

```
async baseFunction(request: Promise<any>, callback: (data: any) => any, error?: string): Promise<any>
```

### The Promise

Because your request to your agent might have any number of parameters, we accept any type of Promise as the first parameter of the `baseFunction`, such as an Axios or `fetch` request.

This Promise will be awaited, and then returned as a resolved Promise or rejected. The `AgencyQR.tsx` component is designed to catch any errors downstream, so don't worry about error handling just yet.

### The Callback

Sometimes you need to manipulate the Promise's response for the UI to safely handle the data. For example, the Kiva backend will automatically generate a connection ID for you when a connection invitation is created, so the connection ID needs to be saved in this step. Also, the invitation object itself needs to be base64 encoded in order to be rendered as a QR code.

The callback is where you do this handling. If you don't need to do any handling, you can simply provide a function that returns the data.

```
getData(data: any) {
    return data;
}

....

super.check(fetch(...), this.getData);
```

### The Error Message
By default, the error generated from a rejected Promise will be passed down for the UI to render. However, if you don't want to use this default message, you can provide your own error string here.

## `IAgent`

Agents used in our React component are required to implement `IAgent`, which is used to normalize the differences in different agents' connection and verification response schemas.

### `establishConnection(connectionId: string): Promise<any>`

This asynchronous method takes a connection ID and can then return any data type wrapped in a Promise. The method is used to provide an invitation string for rendering as a QR code, so we highly recommend you modify your response so that it returns a string.

If you're extending `BaseAgent`, this can be used in conjunction with `super.establish()`.

### `getConnection(connectionId: string): Promise<any>`

This asynchronous method uses the connection ID used in the creation of the invitation from `establishConnection` and makes a request to check the status of the connection. You can return any data type within a Promise from this method.

This method is called recursively once the connection invitation is created, so be sure to consider how much data you want to pull from your agent.

If you're extending `BaseAgent`, this can be used in conjunction with `super.check()`.

### `isConnected(connectionStatus: any): boolean`

This method consumes the connection status data returned by `getConnection` and returns a boolean indicating whether the status has been accepted by the invited party.

For example, if we know that a connection status object will have a `state` key whose value is `connected` once the connection is accepted, the method could be written like this.

```
isConnected(connectionStatus: any): boolean {
    if (connectionStatus.state === 'connected') {
        return true;
    }
    return false;
}
```
### `sendVerification(connectionId: string, profile: ProofRequestProfile): Promise<string>`

This asynchronous method accepts the proof profile object and the connection ID from the invitation, starts a verification request and then returns the ID of the verification request wrapped in a Promise.

If you're extending `BaseAgent`, this can be used in conjunction with `super.send()`.

### `checkVerification(verificationId: string): Promise<any>`

This asynchronous method accepts the verification ID created in `sendVerification` and returns the current status of the verification wrapped in a Promise.

This method is called recursively, so consider how much data you want to request from your agent.

If you're extending `BaseAgent`, this can be used in conjunction with `super.prove()`.

### `isVerified(verificationStatus: any): boolean`

Similar to `isConnected`, this method checks the returned value of `checkVerification` and checks if the value fits the conditions required to be considered proven.

### `formatProof(proof: any): any`

This method is designed to manipulate the response schema returned from `checkVerification` once the data is verified so that it corresponds with the keys needed to successfully render the user details page.

Typically, this data should correspond to the configuration you provided for `pii_map` in your configuration JSON file, because this configuration is what the `ResultDetails.tsx` component uses in order to decide what values to show in the UI.

### `getProof(data: any): any`

This method takes the response of the `checkVerification` method and extracts the proven data.
