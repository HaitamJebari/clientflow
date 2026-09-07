import Swal from 'sweetalert2';

export const clientFlowSwal =
  Swal.mixin({
    customClass: {
      popup:
        'clientflow-swal',

      title:
        'clientflow-swal-title',

      htmlContainer:
        'clientflow-swal-text',

      confirmButton:
        'clientflow-swal-confirm',

      cancelButton:
        'clientflow-swal-cancel',

      actions:
        'clientflow-swal-actions',
    },

    buttonsStyling: false,

    showClass: {
      popup:
        'swal2-show',
    },

    hideClass: {
      popup:
        'swal2-hide',
    },
  });