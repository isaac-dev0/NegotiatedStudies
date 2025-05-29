import "@testing-library/jest-dom";
import "@testing-library/jest-dom/jest-globals";

Object.defineProperty(global.Element.prototype, "scrollIntoView", {
  configurable: true,
  value: jest.fn(),
});
