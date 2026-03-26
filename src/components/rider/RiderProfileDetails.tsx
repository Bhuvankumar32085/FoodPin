import {
  RiIdCardLine,
  RiMapPin2Line,
  RiErrorWarningFill,
} from "react-icons/ri";
import type { IRider, Location } from "../../type";

const RiderProfileDetails = ({
  riderData,
  location,
}: {
  riderData: IRider;
  location: Location | null;
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
      {/* Identity Column */}
      <div className="lg:col-span-7 space-y-8">
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <RiIdCardLine size={24} className="text-orange-500" /> Identity &
            Documents
          </h3>
          <div className="space-y-4">
            {/* Same fields as before */}
            <p className="font-bold text-gray-800">
              Aadhar: XXXX {riderData.addharNummber?.slice(-4)}
            </p>
            <p className="font-bold text-gray-800">
              DL: {riderData.drivingLicenseNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Location Column */}
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 relative">
          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-3">
            <RiMapPin2Line size={22} className="text-red-500" /> Current
            Location
          </h3>
          <p className="text-sm font-bold text-gray-700 bg-gray-50 p-4 rounded-2xl">
            {location?.formattedAddress}
          </p>
        </div>

        {!riderData.isVerified && (
          <div className="bg-linear-to-br from-red-500 to-orange-600 rounded-3xl p-6 text-white text-center">
            <RiErrorWarningFill
              size={32}
              className="mx-auto mb-2 text-white/80"
            />
            <p className="font-bold">Verification Pending</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default RiderProfileDetails;
