import * as JQuery from "../src/libs/jquery-3.2.1.min";
import { OS as _OS_ } from "../dist/antos";
// some global variable
const _w_ = window as any;
_w_.$ = JQuery;
const OS = _OS_ as any;
_w_.OS = OS;

interface GenericObject<T> {
    [propName: string]: T;
}

// test the string trim API
test("Test string trim", () => {
    let s = "hhhhhhello worddddddd" as any;
    expect(s.trimFromLeft("h")).toBe("ello worddddddd");
    expect(s.trimFromRight("d")).toBe("hhhhhhello wor");
    let p = "/this/is/the/path/" as any;
    expect(p.trimBy("/")).toBe("this/is/the/path");
})