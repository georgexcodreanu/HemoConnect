namespace HemoConnect.Domain.Enums;

public enum BloodType
{
    O = 0,
    A = 1,
    B = 2,
    AB = 3,
    Unknown = 4
}

public enum RhFactor
{
    Positive = 0,
    Negative = 1,
    Unknown = 2
}

public enum UrgencyLevel
{
    Routine = 1,
    Urgent = 2,
    Critical = 3
}

public enum BagStatus
{
    Available,
    Allocated,
    Transfused,
    Discarded
}

public enum RequestStatus
{
    Pending,
    PartiallyAllocated,
    Fulfilled,
    Completed
}

public enum AppointmentStatus
{
    Pending = 0,
    Completed = 1,
    Cancelled = 2
}

public enum Gender
{
    Male = 0,
    Female = 1
}
