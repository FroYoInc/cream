module ParamValid {
    /**
     * Takes an unrestricted number of arguments and checks it they are undefined.
     * @param  {any[]}   ...args [A list of arguments]
     * @return {boolean}         [This will return true if all of the agruments passed are defined and false otherwise]
     */
    export function verifyParams(...args:any[]) : boolean{
        for(var i = 0; i < arguments.length; ++i){
            if(arguments[i] === undefined){
                return false;
            }
        }
        return true;
    }
}

export = ParamValid;