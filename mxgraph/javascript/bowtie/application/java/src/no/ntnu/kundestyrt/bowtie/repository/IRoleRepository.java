package no.ntnu.kundestyrt.bowtie.repository;

import no.ntnu.kundestyrt.bowtie.models.Graph;
import no.ntnu.kundestyrt.bowtie.models.Role;
import no.ntnu.kundestyrt.bowtie.models.User;

public interface IRoleRepository {
  public void insertRole(Role r);

  public void updateRole(Role r);

  public Role getUserRoleForGraph(Graph g, User u);
}
