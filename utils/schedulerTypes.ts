export enum SchedulerType {
  PNDM = "PNDM",
  KLMS = "KLMS",
  DDIM = "DDIM",
  K_EULER = "K_EULER",
  EULER_A = "Euler_A",
  DPMSolverMultistep = "DPMSolverMultistep",
  DPMSolverSDEKarras = "DPM++_SDE_Karras",
  DPMSolverMultistepKarras = "DPM++_2M_Karras",
}

// Helper function to get all scheduler types
export const getSchedulerTypes = (): SchedulerType[] =>
  Object.values(SchedulerType);

// Helper function to validate scheduler type
export const isValidSchedulerType = (type: string): type is SchedulerType => {
  return Object.values(SchedulerType).includes(type as SchedulerType);
};
