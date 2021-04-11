const errorString = "VM Exception while processing transaction: ";

async function tryCatch(promise, reason) {
    let expectedErrorMessage = errorString + reason;
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, `Expected a VM exception with reason '${reason}' but did not get any`);
        assert(error.message.search(expectedErrorMessage) >= 0, 
            "Expected an error containing '" + expectedErrorMessage + "' but got '" + error.message + "' instead");
    }
};

module.exports = {
    catchCustomError       : async function(promise, reason) {await tryCatch(promise, "revert " + reason);},
    catchRevert            : async function(promise) {await tryCatch(promise, "revert"             );},
    catchOutOfGas          : async function(promise) {await tryCatch(promise, "out of gas"         );},
    catchInvalidJump       : async function(promise) {await tryCatch(promise, "invalid JUMP"       );},
    catchInvalidOpcode     : async function(promise) {await tryCatch(promise, "invalid opcode"     );},
    catchStackOverflow     : async function(promise) {await tryCatch(promise, "stack overflow"     );},
    catchStackUnderflow    : async function(promise) {await tryCatch(promise, "stack underflow"    );},
    catchStaticStateChange : async function(promise) {await tryCatch(promise, "static state change");},
};