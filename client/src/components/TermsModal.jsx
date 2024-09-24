import React from 'react';

const TermsModal = ({ onAgree }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-xl font-inter">
        <h2 className="text-xl font-bold mb-4">Important Notice</h2>
        <p className="text-sm">
          By using this site, you agree to follow the rules below:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm">
          <li>All content created on this site must be Safe For Work (SFW).</li>
          <li>No pornography, gore, or other NSFW content is allowed.</li>
          <li>Violations will result in a permanent IP and device ban.</li>
        </ul>
        <p className="text-sm mt-4">
          If you do not agree to these rules, please leave the site. By continuing to use this site, you agree to these terms automatically.
        </p>
        <p className="text-sm mt-2">
          For more details, please refer to our <a href={'/terms'} target="_blank" rel="noreferrer" referrerPolicy="no-referrer" className="text-blue-500">Terms, Conditions, and Privacy Policy</a>.
        </p>
        <div className="mt-6">
          <button
            onClick={onAgree}
            className="px-4 py-2 w-full transition bg-green-600 text-white rounded-xl hover:bg-green-500"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
