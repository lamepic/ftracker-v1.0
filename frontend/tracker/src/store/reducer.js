import * as actionTypes from "./actionTypes";

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_TOKEN:
      localStorage.setItem("token", action.payload);
      return {
        ...state,
        token: action.payload,
        isLoading: false,
        isAuthenticated: true,
      };
    case actionTypes.SET_USER:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        isAuthenticated: true,
      };
    case actionTypes.SET_INCOMING_COUNT:
      return {
        ...state,
        incomingCount: action.payload,
      };
    case actionTypes.NEW_INCOMING:
      return {
        ...state,
        newIncoming: !state.newIncoming,
      };
    case actionTypes.SET_OUTGOING_COUNT:
      return {
        ...state,
        outgoingCount: action.payload,
      };
    case actionTypes.SET_ARCHIVE_COUNT:
      return {
        ...state,
        archiveCount: action.payload,
      };
    case actionTypes.SET_NOTIFICATIONS_COUNT:
      return {
        ...state,
        notificationsCount: action.payload,
      };
    case actionTypes.SET_OPEN_TRACKING_MODAL:
      return {
        ...state,
        openTrackingModal: action.payload,
      };
    case actionTypes.SET_TRACKING_DOC_ID:
      return {
        ...state,
        trackingDocId: action.payload,
      };
    case actionTypes.SET_DOCTYPE:
      return {
        ...state,
        documentType: action.payload,
      };
    case actionTypes.SET_VIEW_DOCUMENT:
      return {
        ...state,
        viewDocument: action.payload,
      };
    case actionTypes.SET_REQUEST_DETAILS:
      return {
        ...state,
        request_details: action.payload,
      };
    case actionTypes.SET_ACTIVATED_DOCUMENTS_DETAILS:
      return {
        ...state,
        activatedDocumentDetails: action.payload,
      };
    case actionTypes.SET_BREADCRUMBS:
      localStorage.setItem(
        "breadcrumbs",
        JSON.stringify([...state.breadcrumbs, action.payload])
      );
      return {
        ...state,
        breadcrumbs: [...state.breadcrumbs, action.payload],
      };
    case actionTypes.REMOVE_BREADCRUMBS:
      localStorage.setItem(
        "breadcrumbs",
        JSON.stringify(state.breadcrumbs.slice(0, action.payload + 1))
      );
      return {
        ...state,
        breadcrumbs: state.breadcrumbs.slice(0, action.payload + 1),
      };
    case actionTypes.POP_BREADCRUMBS:
      localStorage.setItem(
        "breadcrumbs",
        JSON.stringify(state.breadcrumbs.slice(0, state.breadcrumbs.length - 1))
      );
      return {
        ...state,
        breadcrumbs: state.breadcrumbs.slice(0, state.breadcrumbs.length - 1),
      };
    case actionTypes.OPEN_PASSWORD_MODAL:
      return {
        ...state,
        openPasswordModal: action.payload,
      };
    case actionTypes.CLEAR_BREADCRUMBS:
      localStorage.setItem("breadcrumbs", JSON.stringify([]));
      return {
        ...state,
        breadcrumbs: [],
      };
    case actionTypes.LOGIN_FAIL:
    case actionTypes.AUTH_ERROR:
    case actionTypes.LOGOUT_SUCCESS:
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};
export default reducer;
