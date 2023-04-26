/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"

//Misc for all test suites
const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })

jest.mock("../app/Store", () => mockStore)

//Unit test suites
describe("Given I am connected as an employee", () => {
  beforeAll(() => {
    //Setting up mocked localStorage and employee user
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
  })

  describe("When I am on NewBill Page", () => {
    test("Then new bill icon (mail) in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      //make sure mailIcon got 'active-icon' class name because it is used to highlight icon
      expect(mailIcon.classList.contains('active-icon')).toBe(true)
    })

    describe("When I upload a file with an allowed file extension", () => {
      test("Then the file is accepted, no error message appear on page", () => {
        document.body.innerHTML = NewBillUI()
        const newBillContainer = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

        const simulatedHandleChangeFile = jest.fn((e) => newBillContainer.handleChangeFile(e))
        const testImageFile = new File(["testImage"], "testImage.jpeg", { type: "image/jpeg" })
        const chooseAFileInput = screen.getByTestId('file')
        chooseAFileInput.addEventListener("change", simulatedHandleChangeFile)

        //make sure file input is empty at the beginning
        expect(chooseAFileInput.files.length).toBe(0);

        userEvent.upload(chooseAFileInput, testImageFile)
        //make sure simulatedHandleChangeFile() got called only once
        expect(simulatedHandleChangeFile.mock.calls).toHaveLength(1)
        expect(chooseAFileInput.files[0].name).toBe("testImage.jpeg")

        //make sure an error message don't appear
        const errorMessage = screen.getByTestId('file-error-message')
        expect(errorMessage.classList.contains("hidden-message")).toBe(true)
      })
    })

    describe("When I upload a file with a disallowed file extension", () => {
      test("Then the file is not accepted, an error message appear on page", () => {
        document.body.innerHTML = NewBillUI()
        const newBillContainer = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

        const simulatedHandleChangeFile = jest.fn((e) => newBillContainer.handleChangeFile(e))
        const testPDFFile = new File(["testPDF"], "testPDF.pdf", { type: "application/pdf" })
        const chooseAFileInput = screen.getByTestId('file')
        chooseAFileInput.addEventListener("change", simulatedHandleChangeFile)

        //make sure file input is empty at the beginning
        expect(chooseAFileInput.files.length).toBe(0);

        userEvent.upload(chooseAFileInput, testPDFFile)
        //make sure simulatedHandleChangeFile() got called only once
        expect(simulatedHandleChangeFile.mock.calls).toHaveLength(1)
        expect(chooseAFileInput.files[0].name).toBe("testPDF.pdf")

        //make sure an error message appear
        const errorMessage = screen.getByTestId('file-error-message')
        expect(errorMessage.classList.contains("hidden-message")).toBe(false)
      })
    })

    describe("When I am on New Bill Page and submit the form", () => {
      test("Then handleSubmit method should be called", () => {
        document.body.innerHTML = NewBillUI()
        const newBillContainer = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })

        const simulatedHandleSubmit = jest.fn((e) => newBillContainer.handleSubmit(e))
        const newBillForm = screen.getByTestId('form-new-bill')
        newBillForm.addEventListener("submit", simulatedHandleSubmit)

        fireEvent.submit(newBillForm)

        //make sure simulatedHandleSubmit got called only once
        expect(simulatedHandleSubmit.mock.calls).toHaveLength(1)
      })
    })
  })
})

//NewBill POST integration test
describe("Given I am connected as an employee", () => {
  describe("When I am on New Bill Page and submit the filled form to create a new bill", () => {
    test("Then handleSubmit method is called and I'm redirected to Bills Page", async () => {
      //Setting up mocked localStorage and employee user with an email
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a" }))

      document.body.innerHTML = NewBillUI()
      const newBillContainer = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })

      const simulatedHandleSubmit = jest.fn((e) => newBillContainer.handleSubmit(e))
      const newBillForm = screen.getByTestId('form-new-bill')
      newBillForm.addEventListener("submit", simulatedHandleSubmit)

      //fill the form
      userEvent.type(screen.getByTestId('expense-name'), "Vol Paris Londres")
      userEvent.type(screen.getByTestId('datepicker'), "28/04/2023")
      userEvent.type(screen.getByTestId('amount'), "348")
      userEvent.type(screen.getByTestId('vat'), "70")
      userEvent.type(screen.getByTestId('pct'), "20")
      const testImageFile = new File(["testImage"], "testImage.jpeg", { type: "image/jpeg" })
      userEvent.upload(screen.getByTestId('file'), testImageFile)

      fireEvent.submit(newBillForm)

      //make sure simulatedHandleSubmit got called only once
      expect(simulatedHandleSubmit.mock.calls).toHaveLength(1)
      //make sure we got redirected
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
  })
})