/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
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

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //make sure windowIcon got 'active-icon' class name because it is used to highlight icon
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I am on Bills Page and click on 'Nouvelle note de frais' button", () => {
    test("Then I should be redirected to the New Bill Page", async () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const store = null
      const billsContainer = new Bills({ document, onNavigate, store, localStorage: window.localStorage })

      const simulatedHandleClickNewBill = jest.fn(() => billsContainer.handleClickNewBill())

      const newBillButton = screen.getByTestId("btn-new-bill")
      newBillButton.addEventListener("click", simulatedHandleClickNewBill)
      userEvent.click(newBillButton)
      //make sure simulatedHandleClickNewBill() got called only once
      expect(simulatedHandleClickNewBill.mock.calls).toHaveLength(1)

      //make sure New Bill Page title appear after being redirected
      await waitFor(() => screen.getByTestId("new-bill-title"))
      expect(screen.getByTestId("new-bill-title").textContent).toBe(" Envoyer une note de frais ")
    })
  })

  describe("When I am on Bills Page and click on an eyed icon button", () => {
    test("Then a modal is opened and I should see the supporting document", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const store = null
      const billsContainer = new Bills({ document, onNavigate, store, localStorage: window.localStorage })

      const simulatedHandleClickIconEye = jest.fn(icon => billsContainer.handleClickIconEye(icon))
      $.fn.modal = jest.fn()

      const modaleFileEmployee = screen.getByTestId('modaleFileEmployee')
      const eyeIconButtons = screen.getAllByTestId("icon-eye")
      eyeIconButtons.forEach(iconButton => {
        iconButton.addEventListener("click", () => simulatedHandleClickIconEye(iconButton))
        userEvent.click(iconButton)
        //make sure a modal is opened after a click on eye icon button
        expect(simulatedHandleClickIconEye).toHaveBeenCalled()
        expect(modaleFileEmployee).toBeTruthy()
      })
      //make sure simulatedHandleClickIconEye() got called only 4 times because we have 4 bills in mocked data
      expect(simulatedHandleClickIconEye.mock.calls).toHaveLength(4)
    })
  })
})

//Bills GET integration tests
describe("Given I am connected as an employee", () => {
  beforeAll(() => {
    //Setting up mocked localStorage and employee user with an email
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a" }))
  })

  describe("When I get redirected to the Bills Page", () => {
    test("Then it fetches bills from mock API GET", async () => {
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      //make sure Bills Page title appear
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()

      //make sure there are 4 mocked bills that got fetched
      const fetchedBills = screen.getByTestId('tbody').querySelectorAll('tr')
      expect(fetchedBills.length).toBe(4)
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      afterEach(() => root.innerHTML = "")

      test("Then it try to fetch bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})