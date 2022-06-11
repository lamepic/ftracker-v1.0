const initialState = {
  token: localStorage.getItem("beans"),
  breadcrumbs: JSON.parse(localStorage.getItem("breadcrumbs")),
  isAuthenticated: false,
  isLoading: true,
  user: null,
  viewDocument: null,
  incomingCount: 0,
  outgoingCount: 0,
  archiveCount: 0,
  openTrackingModal: false,
  trackingDocId: null,
  documentType: null,
  notificationsCount: 0,
  request_details: null,
  activatedDocumentDetails: null,
  openPasswordModal: false,
  newIncoming: false,
  socketSignal: false,
};

export default initialState;
