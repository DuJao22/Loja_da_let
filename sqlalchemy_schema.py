from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.sql import func

Base = declarative_base()

class Service(Base):
    __tablename__ = 'services'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    image = Column(String)
    duration = Column(Integer, default=30)
    
    appointments = relationship("Appointment", back_populates="service")

class Client(Base):
    __tablename__ = 'clients'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    appointments = relationship("Appointment", back_populates="client")

class Appointment(Base):
    __tablename__ = 'appointments'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey('clients.id'))
    service_id = Column(Integer, ForeignKey('services.id'))
    date = Column(String, nullable=False) # Storing as YYYY-MM-DD string to match Node app
    time = Column(String, nullable=False) # Storing as HH:MM string
    observation = Column(String)
    status = Column(String, default='Agendado') # Agendado, Confirmado, Concluído, Cancelado
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

def init_db(connection_string):
    """
    Initializes the database with the defined schema.
    
    Args:
        connection_string (str): The SQLAlchemy connection string.
        Example for SQLite Cloud: 'sqlitecloud://user:password@host:port/dbname?apikey=...'
    """
    engine = create_engine(connection_string)
    Base.metadata.create_all(engine)
    print("Database schema created successfully.")

if __name__ == "__main__":
    # Example usage:
    # Replace with your actual SQLite Cloud connection string
    # connection_string = "sqlitecloud://user:password@host:port/database?apikey=..."
    # init_db(connection_string)
    print("SQLAlchemy models defined. Import 'init_db' to generate the database.")
