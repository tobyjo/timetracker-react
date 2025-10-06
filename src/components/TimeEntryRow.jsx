const TimeEntryRow = ({timeEntry}) => {
  return (
    <>
     <tr>
              <td className="ps-4 fw-semibold">{timeEntry.projectCode}</td>
              <td className="text-muted">{timeEntry.segmentTypeName}</td>
              <td className="text-muted">{new Date(timeEntry.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(timeEntry.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td className="text-end pe-4">
                <a href="#" className="fw-semibold text-primary text-decoration-none">
                  Edit
                </a>
              </td>
            </tr>
           
            </>
  );
}

export default TimeEntryRow;